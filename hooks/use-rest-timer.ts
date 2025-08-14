"use client"

import { useEffect, useState } from "react"
import { useUIStore } from "@/stores/ui"

export function useRestTimer(initial: number = 0) {
  const { restTimer, setRestTimer } = useUIStore()
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined
    if (running && restTimer > 0) {
      timer = setInterval(() => setRestTimer(restTimer - 1), 1000)
    }
    if (restTimer === 0) setRunning(false)
    return () => clearInterval(timer)
  }, [running, restTimer, setRestTimer])

  function start(sec: number) {
    setRestTimer(sec)
    setRunning(true)
  }

  return { seconds: restTimer, running, start }
}
