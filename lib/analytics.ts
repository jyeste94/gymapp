import type { Session } from "@/data/models"

export interface AnalyticsData {
  totalSessions: number
  totalVolume: number
  totalDistance: number
  totalTime: number
  averageSessionDuration: number
  personalRecords: PersonalRecord[]
  volumeByWeek: VolumeData[]
  strengthProgress: ProgressData[]
  runningProgress: RunningData[]
  exerciseFrequency: ExerciseFrequency[]
}

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  type: "weight" | "reps" | "distance" | "time"
  value: number
  date: string
  previousValue?: number
}

export interface VolumeData {
  week: string
  volume: number
  sessions: number
}

export interface ProgressData {
  date: string
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  volume: number
  estimatedMax: number
}

export interface RunningData {
  date: string
  distance: number
  duration: number
  pace: number
  elevation?: number
}

export interface ExerciseFrequency {
  exerciseId: string
  exerciseName: string
  count: number
  lastPerformed: string
}

export class AnalyticsService {
  static calculateAnalytics(sessions: Session[]): AnalyticsData {
    const strengthSessions = sessions.filter((s) => s.type === "strength")
    const runningSessions = sessions.filter((s) => s.type === "running")

    return {
      totalSessions: sessions.length,
      totalVolume: this.calculateTotalVolume(strengthSessions),
      totalDistance: this.calculateTotalDistance(runningSessions),
      totalTime: this.calculateTotalTime(sessions),
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      personalRecords: this.findPersonalRecords(sessions),
      volumeByWeek: this.calculateVolumeByWeek(strengthSessions),
      strengthProgress: this.calculateStrengthProgress(strengthSessions),
      runningProgress: this.calculateRunningProgress(runningSessions),
      exerciseFrequency: this.calculateExerciseFrequency(strengthSessions),
    }
  }

  private static calculateTotalVolume(sessions: Session[]): number {
    return sessions.reduce((total, session) => {
      if (session.type === "strength" && session.exercises) {
        return (
          total +
          session.exercises.reduce((sessionTotal, exercise) => {
            return (
              sessionTotal +
              exercise.sets.reduce((setTotal, set) => {
                return setTotal + (set.weight || 0) * (set.reps || 0)
              }, 0)
            )
          }, 0)
        )
      }
      return total
    }, 0)
  }

  private static calculateTotalDistance(sessions: Session[]): number {
    return sessions.reduce((total, session) => {
      if (session.type === "running" && session.distance) {
        return total + session.distance
      }
      return total
    }, 0)
  }

  private static calculateTotalTime(sessions: Session[]): number {
    return sessions.reduce((total, session) => {
      return total + (session.duration || 0)
    }, 0)
  }

  private static calculateAverageSessionDuration(sessions: Session[]): number {
    if (sessions.length === 0) return 0
    const totalTime = this.calculateTotalTime(sessions)
    return totalTime / sessions.length
  }

  private static findPersonalRecords(sessions: Session[]): PersonalRecord[] {
    const records: Map<string, PersonalRecord> = new Map()

    sessions.forEach((session) => {
      if (session.type === "strength" && session.exercises) {
        session.exercises.forEach((exercise) => {
          exercise.sets.forEach((set) => {
            if (set.weight && set.reps) {
              const key = `${exercise.exerciseId}-weight`
              const currentRecord = records.get(key)

              if (!currentRecord || set.weight > currentRecord.value) {
                records.set(key, {
                  exerciseId: exercise.exerciseId,
                  exerciseName: exercise.exerciseName,
                  type: "weight",
                  value: set.weight,
                  date: session.date,
                  previousValue: currentRecord?.value,
                })
              }

              // Check for rep PR at same weight
              const repKey = `${exercise.exerciseId}-reps-${set.weight}`
              const currentRepRecord = records.get(repKey)

              if (!currentRepRecord || set.reps > currentRepRecord.value) {
                records.set(repKey, {
                  exerciseId: exercise.exerciseId,
                  exerciseName: `${exercise.exerciseName} (${set.weight}kg)`,
                  type: "reps",
                  value: set.reps,
                  date: session.date,
                  previousValue: currentRepRecord?.value,
                })
              }
            }
          })
        })
      }
    })

    return Array.from(records.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  private static calculateVolumeByWeek(sessions: Session[]): VolumeData[] {
    const weeklyData: Map<string, { volume: number; sessions: number }> = new Map()

    sessions.forEach((session) => {
      const date = new Date(session.date)
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      const weekKey = weekStart.toISOString().split("T")[0]

      const volume =
        session.exercises?.reduce((total, exercise) => {
          return (
            total +
            exercise.sets.reduce((setTotal, set) => {
              return setTotal + (set.weight || 0) * (set.reps || 0)
            }, 0)
          )
        }, 0) || 0

      const current = weeklyData.get(weekKey) || { volume: 0, sessions: 0 }
      weeklyData.set(weekKey, {
        volume: current.volume + volume,
        sessions: current.sessions + 1,
      })
    })

    return Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        week,
        volume: data.volume,
        sessions: data.sessions,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
  }

  private static calculateStrengthProgress(sessions: Session[]): ProgressData[] {
    const progressData: ProgressData[] = []

    sessions.forEach((session) => {
      if (session.exercises) {
        session.exercises.forEach((exercise) => {
          const bestSet = exercise.sets.reduce((best, set) => {
            if (!set.weight || !set.reps) return best
            const volume = set.weight * set.reps
            return !best || volume > best.weight * best.reps ? set : best
          }, null as any)

          if (bestSet) {
            progressData.push({
              date: session.date,
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exerciseName,
              weight: bestSet.weight,
              reps: bestSet.reps,
              volume: bestSet.weight * bestSet.reps,
              estimatedMax: this.calculateEstimatedMax(bestSet.weight, bestSet.reps),
            })
          }
        })
      }
    })

    return progressData.sort((a, b) => a.date.localeCompare(b.date))
  }

  private static calculateRunningProgress(sessions: Session[]): RunningData[] {
    return sessions
      .filter((session) => session.type === "running" && session.distance && session.duration)
      .map((session) => ({
        date: session.date,
        distance: session.distance!,
        duration: session.duration!,
        pace: session.duration! / session.distance!,
        elevation: session.elevation,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static calculateExerciseFrequency(sessions: Session[]): ExerciseFrequency[] {
    const frequency: Map<string, { count: number; lastPerformed: string; name: string }> = new Map()

    sessions.forEach((session) => {
      if (session.exercises) {
        session.exercises.forEach((exercise) => {
          const current = frequency.get(exercise.exerciseId) || {
            count: 0,
            lastPerformed: session.date,
            name: exercise.exerciseName,
          }

          frequency.set(exercise.exerciseId, {
            count: current.count + 1,
            lastPerformed: session.date > current.lastPerformed ? session.date : current.lastPerformed,
            name: exercise.exerciseName,
          })
        })
      }
    })

    return Array.from(frequency.entries())
      .map(([exerciseId, data]) => ({
        exerciseId,
        exerciseName: data.name,
        count: data.count,
        lastPerformed: data.lastPerformed,
      }))
      .sort((a, b) => b.count - a.count)
  }

  private static calculateEstimatedMax(weight: number, reps: number): number {
    // Epley formula: 1RM = weight * (1 + reps/30)
    return Math.round(weight * (1 + reps / 30))
  }

  static getTimeRangeFilter(sessions: Session[], range: "week" | "month" | "quarter" | "year"): Session[] {
    const now = new Date()
    const cutoff = new Date()

    switch (range) {
      case "week":
        cutoff.setDate(now.getDate() - 7)
        break
      case "month":
        cutoff.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        cutoff.setMonth(now.getMonth() - 3)
        break
      case "year":
        cutoff.setFullYear(now.getFullYear() - 1)
        break
    }

    return sessions.filter((session) => new Date(session.date) >= cutoff)
  }
}
