import { Routine } from "@/hooks/use-gym-store"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Props {
  routine: Routine
  progress: Record<string, boolean[]>
  onToggle: (exerciseId: string, setIndex: number) => void
  onFinish: () => void
}

export function WorkoutCard({ routine, progress, onToggle, onFinish }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{routine.nombre}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {routine.ejercicios.map((e) => (
          <div key={e.id} className="border rounded p-3">
            <div className="font-medium mb-2">
              {e.nombre} {e.peso ? `${e.peso}kg` : ""}
            </div>
            <div className="flex gap-2">
              {progress[e.id]?.map((done, idx) => (
                <label key={idx} className="flex items-center gap-1">
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => onToggle(e.id, idx)}
                    aria-label={`Serie ${idx + 1}`}
                  />
                  <span className="text-xs">{idx + 1}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {e.series}x{e.reps}
            </div>
          </div>
        ))}
        <Button className="w-full" onClick={onFinish}>
          Finalizar entrenamiento
        </Button>
      </CardContent>
    </Card>
  )
}
