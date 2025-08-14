import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Exercise } from "@/data/models"
import { Home, Building2 } from "lucide-react"

interface ExerciseCardProps {
  exercise: Exercise
}

const difficultyColors = {
  fácil: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  difícil: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
}

const equipmentIcons = {
  "peso corporal": "💪",
  mancuernas: "🏋️",
  barra: "🏋️‍♂️",
  kettlebell: "⚡",
  polea: "🔗",
  máquina: "⚙️",
  banda: "🎯",
  mixto: "🔄",
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <Link href={`/exercises/${exercise.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{exercise.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mb-3">
                {exercise.environment === "casa" ? <Home className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                <span className="capitalize">{exercise.environment}</span>
                <span className="text-2xl ml-2">{equipmentIcons[exercise.equipment]}</span>
              </CardDescription>
            </div>
            <Badge className={difficultyColors[exercise.difficulty]}>{exercise.difficulty}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-2">Músculos principales:</p>
              <div className="flex flex-wrap gap-1">
                {exercise.muscles.slice(0, 3).map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
                {exercise.muscles.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{exercise.muscles.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Patrón de movimiento:</p>
              <Badge variant="outline" className="text-xs capitalize">
                {exercise.movement}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Equipo:</p>
              <Badge variant="outline" className="text-xs capitalize">
                {exercise.equipment}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
