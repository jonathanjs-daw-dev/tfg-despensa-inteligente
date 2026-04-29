import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { recipesApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const BASE_URL = import.meta.env.VITE_API_URL

function RecipeCard({ recipe, onSave, onRemove, saved }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
          }}
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{recipe.name}</CardTitle>
          <Badge variant="outline" className="shrink-0 text-xs">{recipe.estimatedTime}</Badge>
        </div>
        <p className="text-sm text-gray-500">{recipe.description}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Ingredientes</p>
          <ul className="text-sm text-gray-600 space-y-0.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>• {ing.quantity} {ing.unit} de {ing.name}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium mb-1">Preparación</p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            {recipe.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
        <Button
          variant={saved ? 'secondary' : 'outline'}
          size="sm"
          className="w-full mt-auto"
          onClick={() => saved ? onRemove(recipe) : onSave(recipe)}
        >
          {saved ? '✓ Guardada' : 'Guardar receta'}
        </Button>
      </CardContent>
    </Card>
  )
}

function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-video w-full bg-gray-200" />
      <CardHeader className="pb-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full mt-1" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </CardContent>
    </Card>
  )
}

export default function Recipes() {
  const { accessToken } = useAuth()
  const [generated, setGenerated] = useState([])
  const [savedRecipes, setSavedRecipes] = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [status, setStatus] = useState('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadSaved() {
      const res = await recipesApi.getSaved(accessToken)
      if (!res || !res.ok) return
      const data = await res.json()
      setSavedRecipes(data)
      setSavedIds(new Set(data.map((r) => r.name)))
    }
    loadSaved()
  }, [accessToken])

  async function handleGenerate() {
    setStatus('loading')
    setGenerated([])
    setPendingCount(2)
    setError('')

    try {
      const res = await fetch(`${BASE_URL}/recipes/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al generar recetas')
        setStatus('error')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') {
            setStatus('done')
            continue
          }

          const parsed = JSON.parse(payload)
          if (parsed.error) {
            let msg = parsed.error
            try {
              const inner = JSON.parse(msg)
              msg = inner?.error?.message ?? msg
            } catch {}
            setError(msg)
            setStatus('error')
            setPendingCount(0)
            return
          }

          setGenerated((prev) => [...prev, parsed.recipe])
          setPendingCount((prev) => prev - 1)
        }
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  async function handleSave(recipe) {
    const res = await recipesApi.save(accessToken, recipe)
    if (!res || !res.ok) return
    const saved = await res.json()
    setSavedRecipes((prev) => [saved, ...prev])
    setSavedIds((prev) => new Set([...prev, recipe.name]))
  }

  async function handleRemoveSaved(recipe) {
    const target = savedRecipes.find((r) => r.name === recipe.name)
    if (!target) return
    const res = await recipesApi.remove(accessToken, target.id)
    if (!res || !res.ok) return
    setSavedRecipes((prev) => prev.filter((r) => r.id !== target.id))
    setSavedIds((prev) => { const s = new Set(prev); s.delete(recipe.name); return s })
  }

  const isLoading = status === 'loading' || status === 'streaming'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Recetas sugeridas</h1>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? 'Generando...' : 'Generar recetas'}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {(status !== 'idle') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {generated.map((recipe, i) => (
            <RecipeCard
              key={i}
              recipe={recipe}
              saved={savedIds.has(recipe.name)}
              onSave={handleSave}
              onRemove={handleRemoveSaved}
            />
          ))}
          {Array.from({ length: pendingCount }).map((_, i) => (
            <RecipeCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {savedRecipes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Mis recetas guardadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={{ ...recipe, ingredients: recipe.ingredients, steps: recipe.steps }}
                saved={true}
                onSave={handleSave}
                onRemove={handleRemoveSaved}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
