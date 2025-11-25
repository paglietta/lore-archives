import { Star, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState } from "react"

interface MediaCardProps {
  id: number
  title: string
  posterUrl: string
  rating?: number
  year?: string
  onDelete: (id: number) => void
  onRatingChange: (id: number, value: string) => void
}

export function MediaCard({ id, title, posterUrl, rating, year, onDelete, onRatingChange }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isEditingRating, setIsEditingRating] = useState(false)

  return (
    <Card 
      className="group relative overflow-hidden border-border/50 bg-card hover:border-primary/50 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-muted">
        <img
          src={posterUrl}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {isHovered && (
          <button
            onClick={() => onDelete(id)}
            className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full p-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-1 text-card-foreground" title={title}>
          {title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          {year && <span className="text-xs text-muted-foreground">{year}</span>}
          <div 
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => setIsEditingRating(true)}
          >
            <Star className="h-4 w-4 fill-primary text-primary" />
            {isEditingRating ? (
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={rating ?? ""}
                onChange={(e) => onRatingChange(id, e.target.value)}
                onBlur={() => setIsEditingRating(false)}
                autoFocus
                className="w-14 text-sm px-1.5 py-1 text-center border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
            ) : (
              <span className="text-sm font-medium w-14 text-center">
                {rating ? rating.toFixed(1) : "—"}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}