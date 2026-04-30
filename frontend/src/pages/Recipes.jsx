import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { recipesApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePageHeader } from '@/context/PageHeaderContext'
import RecipeCard from '@/components/RecipeCard'
import RecipeSheet from '@/components/RecipeSheet'
import { Sparkles, Bookmark } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL
const FAVORITES_PREVIEW = 4

function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-[16/9] w-full bg-gray-200" />
      <div className="p-3 space-y-1">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-1/4" />
      </div>
    </Card>
  )
}

export default function Recipes() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [generated, setGenerated] = useState([])
  const [savedRecipes, setSavedRecipes] = useState([])
  const [savedIds, setSavedIds] = useState(new Set())
  const [status, setStatus] = useState('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const [error, setError] = useState('')
  const [showAllFavorites, setShowAllFavorites] = useState(false)
  const [activeRecipe, setActiveRecipe] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)

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
            } catch { /* mantener msg original si no es JSON */ }
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

  async function handleRemove(recipe) {
    const target = savedRecipes.find((r) => r.name === recipe.name)
    if (!target) return
    const res = await recipesApi.remove(accessToken, target.id)
    if (!res || !res.ok) return
    setSavedRecipes((prev) => prev.filter((r) => r.id !== target.id))
    setSavedIds((prev) => { const s = new Set(prev); s.delete(recipe.name); return s })
  }

  function openSheet(recipe) {
    setActiveRecipe(recipe)
    setSheetOpen(true)
  }

  const isLoading = status === 'loading' || status === 'streaming'
  const visibleFavorites = showAllFavorites ? savedRecipes : savedRecipes.slice(0, FAVORITES_PREVIEW)

  usePageHeader(
    'Recetas IA',
    <Button onClick={handleGenerate} disabled={isLoading} size="sm">
      {isLoading ? 'Generando...' : 'Generar recetas'}
    </Button>,
  )

  return (
    <div className="space-y-10">

      {/* Top — recetas generadas */}
      <section className="space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}

        {status === 'idle' ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed border-gray-200 space-y-3">
            <Sparkles className="w-8 h-8 text-gray-300" />
            <p className="font-medium text-gray-700">Genera recetas con tus ingredientes usando IA</p>
            <p className="text-sm text-gray-400 max-w-sm">
              Usa los alimentos que tienes en la despensa, priorizando los que van a caducar pronto.
            </p>
            <Button onClick={handleGenerate} className="mt-2">
              Generar recetas
            </Button>
          </div>
        ) : (
          /* Desktop: grid 2 columnas — Mobile: carrusel horizontal */
          <div className="md:grid md:grid-cols-2 md:gap-4 flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:overflow-visible md:pb-0 scrollbar-none">
            {generated.map((recipe, i) => (
              <div key={i} className="snap-start shrink-0 w-[75vw] md:w-auto">
                <RecipeCard recipe={recipe} onClick={() => openSheet(recipe)} />
              </div>
            ))}
            {Array.from({ length: pendingCount }).map((_, i) => (
              <div key={`skeleton-${i}`} className="snap-start shrink-0 w-[75vw] md:w-auto">
                <RecipeCardSkeleton />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom — favoritos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Favoritos
          </h2>
          {savedRecipes.length > FAVORITES_PREVIEW && (
            <button
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              onClick={() => setShowAllFavorites((v) => !v)}
            >
              {showAllFavorites ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>

        {savedRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-gray-200 space-y-2">
            <Bookmark className="w-7 h-7 text-gray-300" />
            <p className="text-sm text-gray-400">
              Añade recetas que te gusten a favoritos para tenerlas siempre a mano.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visibleFavorites.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => navigate(`/recipes/favorites/${recipe.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <RecipeSheet
        recipe={activeRecipe}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={handleSave}
        onRemove={handleRemove}
        saved={activeRecipe ? savedIds.has(activeRecipe.name) : false}
      />
    </div>
  )
}
