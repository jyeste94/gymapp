import { z } from "zod"

export const prSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  dateISO: z.string(),
  weight: z.number().nonnegative(),
  reps: z.number().int().nonnegative(),
  est1RM: z.number().nonnegative(),
})

export type PRSchema = z.infer<typeof prSchema>
