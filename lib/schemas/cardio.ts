import { z } from "zod"

export const cardioLogSchema = z.object({
  id: z.string(),
  dateISO: z.string(),
  type: z.string(),
  distanceKm: z.number().nonnegative(),
  timeSec: z.number().nonnegative(),
  paceSecPerKm: z.number().nonnegative(),
})

export type CardioLogSchema = z.infer<typeof cardioLogSchema>
