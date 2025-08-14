import type { Exercise } from "@/lib/models/exercise"

export async function fetchExercises(): Promise<Exercise[]> {
  const res = await fetch("/api/exercises")
  if (!res.ok) throw new Error("Error fetching exercises")
  return res.json()
}
