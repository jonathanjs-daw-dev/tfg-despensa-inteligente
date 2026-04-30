import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { recipesApi } from '@/services/api'
import { usePageHeader } from '@/context/PageHeaderContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ArrowLeft, Bookmark } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'

export default function RecipePreview() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const [saving, setSaving] = useState(false)

  const recipe = state?.recipe

  usePageHeader('Receta sugerida')

  if (!recipe) {
    navigate('/recipes', { replace: true })
    return null
  }

  async function handleSave() {
    setSaving(true)
    const res = await recipesApi.save(accessToken, recipe)
    if (!res || !res.ok) {
      setSaving(false)
      return
    }
    const saved = await res.json()
    navigate(`/recipes/favorites/${saved.id}`, { replace: true })
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <button
        onClick={() => navigate('/recipes')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a recetas
      </button>

      <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        <img
          src={recipe.imageUrl || FALLBACK_IMAGE}
          alt={recipe.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMAGE }}
        />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold leading-snug">{recipe.name}</h1>
        {recipe.estimatedTime && (
          <Badge variant="secondary" className="text-xs gap-1 font-normal">
            <Clock className="w-3 h-3" />
            {recipe.estimatedTime}
          </Badge>
        )}
        {recipe.description && (
          <p className="text-sm text-gray-500">{recipe.description}</p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Ingredientes</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          {ingredients.map((ing, i) => (
            <li key={i}>• {ing.quantity} {ing.unit} de {ing.name}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Preparación</h2>
        <ol className="text-sm text-gray-600 space-y-3 list-decimal list-inside">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
        <Bookmark className="w-4 h-4" />
        {saving ? 'Guardando...' : 'Guardar en favoritos'}
      </Button>
    </div>
  )
}
