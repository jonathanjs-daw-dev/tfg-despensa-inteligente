import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'

export default function RecipeCard({ recipe, onClick }) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <img
          src={recipe.imageUrl || FALLBACK_IMAGE}
          alt={recipe.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMAGE }}
        />
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold leading-snug line-clamp-2">{recipe.name}</p>
        {recipe.estimatedTime && (
          <Badge variant="secondary" className="text-xs gap-1 font-normal">
            <Clock className="w-3 h-3" />
            {recipe.estimatedTime}
          </Badge>
        )}
      </div>
    </Card>
  )
}
