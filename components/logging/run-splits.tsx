import { Badge } from "@/components/ui/badge"

interface RunSplitsProps {
  intervals: Array<{
    workSec: number
    restSec: number
    reps: number
  }>
}

export function RunSplits({ intervals }: RunSplitsProps) {
  return (
    <div className="mt-3 space-y-2">
      <h5 className="text-sm font-medium">Intervalos:</h5>
      <div className="flex flex-wrap gap-2">
        {intervals.map((interval, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {interval.reps} × {Math.floor(interval.workSec / 60)}:{(interval.workSec % 60).toString().padStart(2, "0")}
            {interval.restSec > 0 &&
              ` (${Math.floor(interval.restSec / 60)}:${(interval.restSec % 60).toString().padStart(2, "0")} desc)`}
          </Badge>
        ))}
      </div>
    </div>
  )
}
