import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

export default function RecipeSheet({ recipe, open, onClose, onSave, onRemove, saved }) {
  const isDesktop = useIsDesktop()

  if (!recipe) return null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side={isDesktop ? 'right' : 'bottom'}
        className={isDesktop ? 'w-[480px] overflow-y-auto' : 'h-[90dvh] overflow-y-auto rounded-t-xl'}
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-lg leading-snug pr-6">{recipe.name}</SheetTitle>
          {recipe.estimatedTime && (
            <Badge variant="secondary" className="w-fit text-xs gap-1 font-normal">
              <Clock className="w-3 h-3" />
              {recipe.estimatedTime}
            </Badge>
          )}
        </SheetHeader>

        <div className="space-y-5">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
            <img
              src={recipe.imageUrl || FALLBACK_IMAGE}
              alt={recipe.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = FALLBACK_IMAGE }}
            />
          </div>

          {recipe.description && (
            <p className="text-sm text-gray-600">{recipe.description}</p>
          )}

          <div>
            <p className="text-sm font-semibold mb-2">Ingredientes</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>• {ing.quantity} {ing.unit} de {ing.name}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Preparación</p>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <Button
            variant={saved ? 'secondary' : 'default'}
            className="w-full"
            onClick={() => saved ? onRemove(recipe) : onSave(recipe)}
          >
            {saved ? '✓ Guardada en favoritos' : 'Guardar en favoritos'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
