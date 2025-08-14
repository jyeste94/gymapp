import type { Routine } from "@/lib/models/routine"

export async function fetchRoutines(): Promise<Routine[]> {
  const res = await fetch("/api/routines")
  if (!res.ok) throw new Error("Error fetching routines")
  return res.json()
}
