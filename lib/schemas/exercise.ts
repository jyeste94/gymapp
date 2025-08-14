import { z } from "zod"

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  musclesPrimary: z.array(z.string()),
  musclesSecondary: z.array(z.string()).optional(),
  equipment: z.union([z.literal("barbell"), z.literal("dumbbell"), z.literal("machine"), z.literal("bodyweight"), z.string()]),
  level: z.union([z.literal("beginner"), z.literal("intermediate"), z.literal("advanced")]),
  media: z
    .object({
      image: z.string().url().optional(),
      video: z.string().url().optional(),
    })
    .optional(),
  instructions: z.array(z.string()),
})

export type ExerciseSchema = z.infer<typeof exerciseSchema>
