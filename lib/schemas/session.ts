import { z } from "zod"

const sessionEntrySchema = z.object({
  exerciseId: z.string(),
  setIndex: z.number().int().nonnegative(),
  planned: z.object({
    reps: z.number().int().nonnegative(),
    weight: z.number().nonnegative(),
    restSec: z.number().nonnegative(),
  }),
  performed: z
    .object({
      reps: z.number().int().nonnegative(),
      weight: z.number().nonnegative(),
      rpe: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
    })
    .optional(),
  status: z.enum(["pending", "done"]),
})

export const sessionSchema = z.object({
  id: z.string(),
  dateISO: z.string(),
  routineId: z.string(),
  entries: z.array(sessionEntrySchema),
  durationSec: z.number().nonnegative().optional(),
  totals: z
    .object({
      volumeByMuscle: z.record(z.number()),
    })
    .optional(),
})

export type SessionSchema = z.infer<typeof sessionSchema>
