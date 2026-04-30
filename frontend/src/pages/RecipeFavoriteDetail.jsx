import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { recipesApi } from '@/services/api'
import { usePageHeader } from '@/context/PageHeaderContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ArrowLeft, Trash2 } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'

export default function RecipeFavoriteDetail() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState(null)
  const [status, setStatus] = useState('loading')
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await recipesApi.getById(accessToken, id)
      if (!res || !res.ok) {
        setStatus('error')
        return
      }
      const data = await res.json()
      setRecipe(data)
      setStatus('done')
    }
    load()
  }, [accessToken, id])

  async function handleRemove() {
    setRemoving(true)
    const res = await recipesApi.remove(accessToken, id)
    if (!res || !res.ok) {
      setRemoving(false)
      return
    }
    navigate('/recipes')
  }

  usePageHeader(
    recipe?.name ?? 'Receta',
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-500 hover:text-red-500"
      disabled={removing}
      onClick={handleRemove}
    >
      <Trash2 className="w-4 h-4" />
    </Button>,
  )

  if (status === 'loading') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="aspect-video w-full rounded-xl bg-gray-200" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    )
  }

  if (status === 'error' || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-gray-500">Receta no encontrada.</p>
        <Button variant="ghost" onClick={() => navigate('/recipes')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a recetas
        </Button>
      </div>
    )
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
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
    </div>
  )
}
