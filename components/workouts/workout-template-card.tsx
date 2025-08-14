import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { WorkoutTemplate } from "@/data/models"
import { Clock, Target, Dumbbell } from "lucide-react"

interface WorkoutTemplateCardProps {
  template: WorkoutTemplate
}

const goalColors = {
  fuerza: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  hipertrofia: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  potencia: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  mixto: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
}

export function WorkoutTemplateCard({ template }: WorkoutTemplateCardProps) {
  const totalExercises = template.blocks.reduce((total, block) => {
    return (
      total +
      block.items.reduce((blockTotal, item) => {
        if ("items" in item) {
          // It's a superset
          return blockTotal + item.items.length
        }
        return blockTotal + 1
      }, 0)
    )
  }, 0)

  const estimatedDuration = Math.max(30, totalExercises * 4) // Rough estimate: 4 minutes per exercise

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Dumbbell className="h-4 w-4" />
                <span>{template.blocks.length} bloques</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{totalExercises} ejercicios</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{estimatedDuration} min</span>
              </div>
            </CardDescription>
          </div>
          {template.goal && (
            <Badge className={goalColors[template.goal]} variant="secondary">
              {template.goal}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Bloques de entrenamiento:</h4>
            <div className="space-y-1">
              {template.blocks.slice(0, 3).map((block, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  • {block.name || `Bloque ${index + 1}`}
                </div>
              ))}
              {template.blocks.length > 3 && (
                <div className="text-sm text-muted-foreground">• +{template.blocks.length - 3} bloques más</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/workouts/${template.id}`}>Ver Detalles</Link>
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Empezar Ahora
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
