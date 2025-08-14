export interface CardioLog {
  id: string
  dateISO: string
  type: "run" | "bike" | "elliptical" | string
  distanceKm: number
  timeSec: number
  paceSecPerKm: number
}
