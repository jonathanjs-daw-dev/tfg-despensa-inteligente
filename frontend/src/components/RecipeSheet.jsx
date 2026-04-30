import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Bookmark } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'

export default function RecipeSheet({ recipe, open, onClose, onSave, onRemove, saved }) {
  if (!recipe) return null

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="block w-[90dvw] md:w-[65dvw] p-0 md:p-12 max-h-[90dvh] overflow-y-auto">
        {/* Imagen */}
        <div className="aspect-video h-[300px] w-full overflow-hidden rounded-t-xl bg-gray-100">
          <img
            src={recipe.imageUrl || FALLBACK_IMAGE}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = FALLBACK_IMAGE
            }}
          />
        </div>

        {/* Contenido */}
        <div className="p-4 md:p-0 md:pt-4 space-y-6">
          {/* Cabecera */}
          <div className="space-y-2 pr-6">
            <h2 className="text-xl font-bold leading-snug">{recipe.name}</h2>
            {recipe.estimatedTime && (
              <Badge variant="secondary" className="text-xs gap-1 font-normal">
                <Clock className="w-3 h-3" />
                {recipe.estimatedTime}
              </Badge>
            )}
            {recipe.description && <p className="text-sm text-gray-500">{recipe.description}</p>}
          </div>

          {/* Ingredientes */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Ingredientes</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {ingredients.map((ing, i) => (
                <li key={i}>
                  • {ing.quantity} {ing.unit} de {ing.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Preparación */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Preparación</h3>
            <ol className="text-sm text-gray-600 space-y-3 list-decimal list-inside">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Acción */}
          <Button
            variant={saved ? 'secondary' : 'default'}
            className="w-full gap-2"
            onClick={() => (saved ? onRemove(recipe) : onSave(recipe))}
          >
            <Bookmark className="w-4 h-4" />
            {saved ? 'Guardada en favoritos' : 'Guardar en favoritos'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
