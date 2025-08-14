export interface SessionEntry {
  exerciseId: string
  setIndex: number
  planned: { reps: number; weight: number; restSec: number }
  performed?: { reps: number; weight: number; rpe?: number; notes?: string }
  status: "pending" | "done"
}

export interface Session {
  id: string
  dateISO: string
  routineId: string
  entries: SessionEntry[]
  durationSec?: number
  totals?: { volumeByMuscle: Record<string, number> }
}
