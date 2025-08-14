import { z } from "zod"

const routineDayBlockSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive().optional(),
  weight: z.number().nonnegative().optional(),
  restSec: z.number().nonnegative().optional(),
  notes: z.string().optional(),
})

const routineDaySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  blocks: z.array(routineDayBlockSchema),
})

export const routineSchema = z.object({
  id: z.string(),
  name: z.string(),
  goal: z.string().optional(),
  days: z.array(routineDaySchema),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type RoutineSchema = z.infer<typeof routineSchema>
