"use client"

import { useMemo } from "react"
import { useSessionsStore } from "@/stores/sessions"

export function useProgressMetrics() {
  const { sessions } = useSessionsStore()

  const volumeByMuscle = useMemo(() => {
    const totals: Record<string, number> = {}
    sessions.forEach((s) => {
      s.totals?.volumeByMuscle &&
        Object.entries(s.totals.volumeByMuscle).forEach(([muscle, vol]) => {
          totals[muscle] = (totals[muscle] || 0) + vol
        })
    })
    return totals
  }, [sessions])

  return { volumeByMuscle }
}
