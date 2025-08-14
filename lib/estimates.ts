// 1RM estimation formulas and utility functions

export function epley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export function brzycki1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return weight * (36 / (37 - reps))
}

export function estimate1RM(weight: number, reps: number, formula: "epley" | "brzycki" = "epley"): number {
  return formula === "epley" ? epley1RM(weight, reps) : brzycki1RM(weight, reps)
}

export function calculatePace(distanceKm: number, durationSec: number): number {
  // Returns pace in seconds per km
  return durationSec / distanceKm
}

export function formatPace(paceSecPerKm: number): string {
  const minutes = Math.floor(paceSecPerKm / 60)
  const seconds = Math.floor(paceSecPerKm % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function convertWeight(weight: number, from: "kg" | "lb", to: "kg" | "lb"): number {
  if (from === to) return weight
  if (from === "kg" && to === "lb") return weight * 2.20462
  if (from === "lb" && to === "kg") return weight / 2.20462
  return weight
}

export function convertDistance(distance: number, from: "km" | "mi", to: "km" | "mi"): number {
  if (from === to) return distance
  if (from === "km" && to === "mi") return distance * 0.621371
  if (from === "mi" && to === "km") return distance / 0.621371
  return distance
}

// Plate calculator for barbell loading
export interface PlateSet {
  weight: number
  count: number
}

export function calculatePlates(targetWeight: number, barWeight = 20): PlateSet[] {
  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25]
  const weightPerSide = (targetWeight - barWeight) / 2

  if (weightPerSide <= 0) return []

  const plates: PlateSet[] = []
  let remaining = weightPerSide

  for (const plate of availablePlates) {
    const count = Math.floor(remaining / plate)
    if (count > 0) {
      plates.push({ weight: plate, count })
      remaining -= plate * count
    }
  }

  return plates
}
