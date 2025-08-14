export interface RoutineDayBlock {
  exerciseId: string
  sets: number
  reps?: number
  weight?: number
  restSec?: number
  notes?: string
}

export interface RoutineDay {
  dayOfWeek: number
  blocks: RoutineDayBlock[]
}

export interface Routine {
  id: string
  name: string
  goal?: string
  days: RoutineDay[]
  createdAt: string
  updatedAt: string
}
