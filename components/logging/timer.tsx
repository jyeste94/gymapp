"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Square, RotateCcw } from "lucide-react"

interface TimerProps {
  initialSeconds?: number
  onComplete?: () => void
  title?: string
}

export function Timer({ initialSeconds = 90, onComplete, title = "Timer" }: TimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [initialTime] = useState(initialSeconds)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            onComplete?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, seconds, onComplete])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setSeconds(initialTime)
    setIsRunning(false)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setSeconds(0)
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((initialTime - seconds) / initialTime) * 100

  return (
    <div className="text-center space-y-4">
      <h3 className="font-medium">{title}</h3>

      <div className="relative">
        <div className="text-6xl font-bold font-mono">{formatTime(seconds)}</div>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2 mt-4">
          <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" onClick={toggleTimer} disabled={seconds === 0} className="bg-transparent">
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="sm" onClick={resetTimer} className="bg-transparent">
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={stopTimer} className="bg-transparent">
          <Square className="h-4 w-4" />
        </Button>
      </div>

      {seconds === 0 && <div className="text-green-600 font-medium">¡Tiempo completado!</div>}
    </div>
  )
}
