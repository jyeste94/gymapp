import { create } from 'zustand'
import { persist, type PersistOptions } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import { addDays, isSameDay, startOfWeek } from 'date-fns'

export type DayOfWeek = 1|2|3|4|5|6|7 // 1 Monday ... 7 Sunday
export type UUID = string

export interface Exercise {
  id: UUID
  name: string
  sets: number
  reps: number
  weight?: number
  restSec?: number
}

export interface Routine {
  id: UUID
  name: string
  days: DayOfWeek[]
  exercises: Exercise[]
  updatedAt: string
}

export interface SessionLog {
  id: UUID
  date: string // ISO YYYY-MM-DD
  routineId: UUID
  completed: boolean
  exercises: Array<{
    exerciseId: UUID
    performedSets: Array<{ reps: number; weight?: number; completed: boolean }>
  }>
  durationSec?: number
}

export interface UserProfile {
  id: UUID
  name: string
  photoUrl?: string
  weeklyGoal: number
  unit: 'kg'|'lb'
}

export interface AppState {
  profile: UserProfile
  routines: Routine[]
  sessionLogs: SessionLog[]
  getTodayRoutine: () => Routine | null
  getWeekStats: () => { trainedDays: number; progressPct: number; streak: number; bestStreak: number; bars: number[] }
  addRoutine: (r: Routine) => void
  updateRoutine: (r: Routine) => void
  deleteRoutine: (id: UUID) => void
  logSession: (log: SessionLog) => void
  setProfile: (p: Partial<UserProfile>) => void
}

const defaultProfile: UserProfile = {
  id: uuid(),
  name: 'Atleta',
  weeklyGoal: 4,
  unit: 'kg'
}

const sampleRoutine: Routine = {
  id: uuid(),
  name: 'Pecho/Espalda',
  days: [1,4],
  updatedAt: new Date().toISOString(),
  exercises: [
    { id: uuid(), name: 'Press banca', sets: 3, reps: 10, weight: 40 },
    { id: uuid(), name: 'Remo', sets: 3, reps: 10, weight: 30 },
    { id: uuid(), name: 'Dominadas', sets: 3, reps: 8 },
    { id: uuid(), name: 'Aperturas', sets: 3, reps: 12, weight: 20 },
    { id: uuid(), name: 'Jalón', sets: 3, reps: 12, weight: 35 }
  ]
}

function weekBars(logs: SessionLog[]): number[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  return Array.from({length:7}).map((_,i)=>{
    const d = addDays(start, i)
    return logs.some(l=>l.completed && isSameDay(new Date(l.date), d)) ? 1 : 0
  })
}

function computeStreak(logs: SessionLog[]): { streak: number; best: number } {
  const sorted = [...logs].sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime())
  let streak=0,best=0
  for(let i=0;i<sorted.length;i++){
    const cur = new Date(sorted[i].date)
    const prev = i>0 ? new Date(sorted[i-1].date) : null
    if(prev && (cur.getTime() - prev.getTime() === 86400000)) streak++
    else streak = 1
    if(streak>best) best = streak
  }
  return { streak, best }
}

const useAppStore = create<AppState>()(persist((set,get)=>({
  profile: defaultProfile,
  routines: [sampleRoutine],
  sessionLogs: [],
  getTodayRoutine: () => {
    const today = (new Date().getDay()||7) as DayOfWeek
    return get().routines.find(r=>r.days.includes(today)) ?? null
  },
  getWeekStats: () => {
    const logs = get().sessionLogs
    const bars = weekBars(logs)
    const trainedDays = bars.reduce((a,b)=>a+b,0)
    const { streak, best } = computeStreak(logs.filter(l=>l.completed))
    const goal = get().profile.weeklyGoal
    return { trainedDays, progressPct: Math.min(100, Math.round(trainedDays/goal*100)), streak, bestStreak: best, bars }
  },
  addRoutine: (r) => set(state=>({ routines: [...state.routines, r] })),
  updateRoutine: (r) => set(state=>({ routines: state.routines.map(x=>x.id===r.id?r:x) })),
  deleteRoutine: (id) => set(state=>({ routines: state.routines.filter(x=>x.id!==id) })),
  logSession: (log) => set(state=>({ sessionLogs: [...state.sessionLogs.filter(l=>l.date!==log.date), log] })),
  setProfile: (p) => set(state=>({ profile: { ...state.profile, ...p } }))
}), { name: 'gymapp:v1' } as PersistOptions<AppState>))

export default useAppStore

