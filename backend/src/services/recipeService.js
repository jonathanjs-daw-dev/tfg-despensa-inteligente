import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import prisma from '../config/db.js'
import { GEMINI_API_KEY, PEXELS_API_KEY, NODE_ENV } from '../config/env.js'

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'

const recipeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  estimatedTime: z.string().min(1),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      unit: z.string(),
    })
  ),
  steps: z.array(z.string()).min(1),
})

function sanitize(str) {
  return str.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 100)
}

async function checkUserLimit(userId) {
  if (NODE_ENV !== 'production') return

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [lastHour, lastDay] = await Promise.all([
    prisma.aiUsageLog.count({
      where: { userId, actionType: 'recipe_generation', createdAt: { gte: oneHourAgo } },
    }),
    prisma.aiUsageLog.count({
      where: { userId, actionType: 'recipe_generation', createdAt: { gte: oneDayAgo } },
    }),
  ])

  if (lastHour >= 3 || lastDay >= 10) {
    const error = new Error(
      'Has alcanzado el límite de generación de recetas. Inténtalo más tarde.'
    )
    error.status = 429
    throw error
  }
}

async function fetchPexelsImage(query) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&locale=es-ES`,
      { headers: { Authorization: PEXELS_API_KEY } }
    )
    const data = await res.json()
    return data.photos?.[0]?.src?.large ?? FALLBACK_IMAGE
  } catch {
    return FALLBACK_IMAGE
  }
}

async function geminiWithRetry(params, maxRetries = 3) {
  let delay = 2000
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params)
    } catch (err) {
      const is503 =
        err?.status === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE')
      if (is503 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, delay))
        delay *= 2
        continue
      }
      throw err
    }
  }
}

function parseGeminiJson(raw) {
  if (!raw) throw new Error('Respuesta de Gemini no es JSON válido')
  const text = raw.trim()
  // Strip markdown fences if present (e.g. ```json ... ```)
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  const candidate = fenceMatch ? fenceMatch[1] : text
  const jsonMatch = candidate.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Respuesta de Gemini no es JSON válido')
  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    throw new Error('Respuesta de Gemini no es JSON válido')
  }
}

async function generateOneRecipe(ingredients, previousNames) {
  const ingredientList = ingredients
    .map(
      (p) =>
        `- ${sanitize(p.name)} (caduca: ${p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('es-ES') : 'sin fecha'})`
    )
    .join('\n')

  const excludeClause =
    previousNames.length > 0
      ? `No repitas estas recetas ya sugeridas: ${previousNames.join(', ')}.`
      : ''

  const prompt = `Eres un chef experto en cocina española y mediterránea.
Genera UNA receta sencilla usando principalmente estos ingredientes disponibles en la despensa, priorizando los que caducan antes:

${ingredientList}

${excludeClause}

Requisitos:
- Receta sencilla, máximo 45 minutos de preparación
- Apta para cocinar en casa sin utensilios especiales
- Usa principalmente los ingredientes listados (puedes asumir que hay sal, aceite y especias básicas)

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta, sin texto adicional, sin markdown, sin bloques de código:
{
  "name": "Nombre del plato",
  "description": "Descripción apetitosa en 1-2 frases",
  "estimatedTime": "XX minutos",
  "ingredients": [
    { "name": "ingrediente", "quantity": "cantidad", "unit": "unidad" }
  ],
  "steps": [
    "Paso 1...",
    "Paso 2..."
  ]
}`

  const geminiConfig = {
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  const response = await geminiWithRetry(geminiConfig)

  const parsed = parseGeminiJson(response.text)
  const validated = recipeSchema.safeParse(parsed)
  if (!validated.success) {
    const retry = await geminiWithRetry(geminiConfig)
    const retryParsed = parseGeminiJson(retry.text)
    const retryValidated = recipeSchema.safeParse(retryParsed)
    if (!retryValidated.success) throw new Error('Respuesta de Gemini no válida tras reintento')
    return retryValidated.data
  }

  return validated.data
}

export async function generateRecipes(userId, sendEvent) {
  await checkUserLimit(userId)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const products = await prisma.product.findMany({
    where: {
      userId,
      NOT: { category: 'LIMPIEZA' },
      OR: [{ expiryDate: null }, { expiryDate: { gte: today } }],
    },
    orderBy: [{ expiryDate: { sort: 'asc', nulls: 'last' } }],
  })

  if (products.length === 0) {
    const error = new Error(
      'No tienes productos disponibles en la despensa (puede que todos estén caducados)'
    )
    error.status = 400
    throw error
  }

  const previousNames = []

  for (let i = 0; i < 2; i++) {
    const recipe = await generateOneRecipe(products, previousNames)
    previousNames.push(recipe.name)
    const imageUrl = await fetchPexelsImage(recipe.name)
    sendEvent({ index: i, recipe: { ...recipe, imageUrl } })
  }

  await prisma.aiUsageLog.create({
    data: { userId, actionType: 'recipe_generation' },
  })
}

export async function getSavedRecipes(userId) {
  return prisma.savedRecipe.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSavedRecipeById(userId, id) {
  return prisma.savedRecipe.findFirst({ where: { id, userId } })
}

export async function saveRecipe(userId, data) {
  return prisma.savedRecipe.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? '',
      imageUrl: data.imageUrl ?? null,
      estimatedTime: data.estimatedTime ?? '',
      ingredients: data.ingredients,
      steps: data.steps,
    },
  })
}

export async function deleteSavedRecipe(userId, id) {
  const existing = await prisma.savedRecipe.findFirst({ where: { id, userId } })
  if (!existing) {
    const error = new Error('Receta no encontrada')
    error.status = 404
    throw error
  }
  return prisma.savedRecipe.delete({ where: { id } })
}
