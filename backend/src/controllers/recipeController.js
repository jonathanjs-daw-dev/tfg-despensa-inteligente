import {
  generateRecipes,
  getSavedRecipes,
  getSavedRecipeById,
  saveRecipe,
  deleteSavedRecipe,
} from '../services/recipeService.js'

export async function generate(req, res) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  function sendEvent(data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    await generateRecipes(req.userId, sendEvent)
    res.write('data: [DONE]\n\n')
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message, status: err.status || 500 })}\n\n`)
  } finally {
    res.end()
  }
}

export async function getSaved(req, res) {
  try {
    const recipes = await getSavedRecipes(req.userId)
    res.status(200).json(recipes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function getSavedById(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID no válido' })
    const recipe = await getSavedRecipeById(req.userId, id)
    if (!recipe) return res.status(404).json({ error: 'Receta no encontrada' })
    res.status(200).json(recipe)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function save(req, res) {
  try {
    const recipe = await saveRecipe(req.userId, req.body)
    res.status(201).json(recipe)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export async function removeSaved(req, res) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'ID no válido' })
    await deleteSavedRecipe(req.userId, id)
    res.status(200).json({ message: 'Receta eliminada' })
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message })
  }
}
