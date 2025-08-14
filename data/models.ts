// Core data models for the fitness tracking app

export interface Exercise {
  id: string
  slug: string
  name: string
  muscles: string[]
  movement: "empuje" | "tirón" | "dominante rodilla" | "dominante cadera" | "core" | "otros"
  equipment: "barra" | "mancuernas" | "kettlebell" | "polea" | "máquina" | "banda" | "peso corporal" | "mixto"
  environment: "gimnasio" | "casa"
  difficulty: "fácil" | "media" | "difícil"
  cues: string[]
  mistakes: string[]
  variations: string[]
  videoUrl?: string
}

export interface SetScheme {
  exerciseId: string
  sets: number
  reps?: number
  repRange?: [number, number]
  weightType: "absoluto" | "%" | "RPE"
  intensity?: number
  tempo?: string
  restSec?: number
  notes?: string
}

export interface Superset {
  name?: string
  items: SetScheme[]
}

export interface Block {
  name?: string
  items: Array<SetScheme | Superset>
}

export interface WorkoutTemplate {
  id: string
  name: string
  goal?: "fuerza" | "hipertrofia" | "potencia" | "mixto"
  blocks: Block[]
}

export interface StrengthEntry {
  exerciseId: string
  setIndex: number
  weight: number
  reps: number
  rir?: number
  rpe?: number
  tempo?: string
  restSec?: number
}

export interface StrengthSession {
  id: string
  dateISO: string
  notes?: string
  entries: StrengthEntry[]
}

export interface RunSession {
  id: string
  dateISO: string
  distanceKm: number
  durationSec: number
  elevationGain?: number
  rpe?: number
  shoe?: string
  intervals?: Array<{
    workSec: number
    restSec: number
    reps: number
  }>
  notes?: string
}

export interface BodyMetrics {
  dateISO: string
  bodyWeightKg?: number
  bodyFatPct?: number
  waistCm?: number
}

export interface Goal {
  id: string
  name: string
  target?: {
    lift?: string
    est1RM?: number
    distanceKm?: number
    timeSec?: number
  }
}

export interface UserSettings {
  units: {
    weight: "kg" | "lb"
    distance: "km" | "mi"
  }
  theme: "light" | "dark" | "system"
  notifications: boolean
}

// Helper type guards
export function isSuperset(item: SetScheme | Superset): item is Superset {
  return "items" in item && Array.isArray(item.items)
}

export function isSetScheme(item: SetScheme | Superset): item is SetScheme {
  return "exerciseId" in item
}
