export interface Exercise {
  id: string
  name: string
  slug: string
  musclesPrimary: string[]
  musclesSecondary?: string[]
  equipment: "barbell" | "dumbbell" | "machine" | "bodyweight" | string
  level: "beginner" | "intermediate" | "advanced"
  media?: { image?: string; video?: string }
  instructions: string[]
}
