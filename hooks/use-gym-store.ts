"use client"
import { useEffect } from "react"
import { useStorage } from "@/hooks/use-storage"
import { nanoid } from "nanoid"

export interface Exercise {
  id: string
  nombre: string
  series: number
  reps: number
  peso?: number
}

export interface Routine {
  id: string
  nombre: string
  diasSemana: number[] // 0 domingo - 6 sabado
  ejercicios: Exercise[]
}

export interface GymState {
  usuario: {
    nombre: string
    metaSemanal: number
  }
  rutinas: Routine[]
  historial: Record<string, boolean>
  progreso: Record<string, Record<string, boolean[]>>
}

const hoyStr = () => new Date().toISOString().split("T")[0]

const defaultState: GymState = {
  usuario: { nombre: "Usuario", metaSemanal: 4 },
  rutinas: [
    {
      id: nanoid(),
      nombre: "Pecho/Espalda",
      diasSemana: [1, 4],
      ejercicios: [
        { id: nanoid(), nombre: "Press banca", series: 3, reps: 10, peso: 60 },
        { id: nanoid(), nombre: "Remo con barra", series: 3, reps: 8, peso: 40 },
      ],
    },
  ],
  historial: {},
  progreso: {},
}

export function useGymStore() {
  const [state, setState] = useStorage<GymState>("gym-state", defaultState)

  // ensure progress for today exists
  useEffect(() => {
    const today = hoyStr()
    if (!state.progreso[today]) {
      const routine = getTodayRoutine(state)
      if (routine) {
        const prog: Record<string, boolean[]> = {}
        routine.ejercicios.forEach((e) => {
          prog[e.id] = Array(e.series).fill(false)
        })
        setState({ ...state, progreso: { ...state.progreso, [today]: prog } })
      }
    }
  }, [])

  const toggleSet = (exerciseId: string, setIndex: number) => {
    const today = hoyStr()
    const dayProgress = state.progreso[today]
    if (!dayProgress) return
    const sets = [...dayProgress[exerciseId]]
    sets[setIndex] = !sets[setIndex]
    const newProg = {
      ...state.progreso,
      [today]: { ...dayProgress, [exerciseId]: sets },
    }
    setState({ ...state, progreso: newProg })
  }

  const finishWorkout = () => {
    const today = hoyStr()
    const newHist = { ...state.historial, [today]: true }
    setState({ ...state, historial: newHist })
  }

  const addRoutine = (r: Routine) => {
    setState({ ...state, rutinas: [...state.rutinas, r] })
  }

  const removeRoutine = (id: string) => {
    setState({ ...state, rutinas: state.rutinas.filter((r) => r.id !== id) })
  }

  const updateGoal = (goal: number) => {
    setState({ ...state, usuario: { ...state.usuario, metaSemanal: goal } })
  }

  const reset = () => {
    setState(defaultState)
  }

  const todayRoutine = getTodayRoutine(state)

  const daysThisWeek = getWeekHistory(state.historial)

  const streak = getStreak(state.historial)

  return {
    state,
    todayRoutine,
    daysThisWeek,
    streak,
    toggleSet,
    finishWorkout,
    addRoutine,
    removeRoutine,
    updateGoal,
    reset,
  }
}

function getTodayRoutine(state: GymState): Routine | undefined {
  const today = new Date().getDay()
  return state.rutinas.find((r) => r.diasSemana.includes(today))
}

function getWeekHistory(historial: Record<string, boolean>): boolean[] {
  const today = new Date()
  const start = new Date(today)
  const day = today.getDay()
  const monday = new Date(start)
  monday.setDate(start.getDate() - ((day + 6) % 7))
  const days: boolean[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = d.toISOString().split("T")[0]
    days.push(Boolean(historial[key]))
  }
  return days
}

function getStreak(historial: Record<string, boolean>): number {
  let streak = 0
  let date = new Date()
  while (true) {
    const key = date.toISOString().split("T")[0]
    if (historial[key]) {
      streak++
      date.setDate(date.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export const createExercise = (nombre = "", series = 3, reps = 10, peso?: number): Exercise => ({
  id: nanoid(),
  nombre,
  series,
  reps,
  peso,
})

export const createRoutine = (nombre: string): Routine => ({
  id: nanoid(),
  nombre,
  diasSemana: [],
  ejercicios: [],
})
