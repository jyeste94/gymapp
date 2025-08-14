'use client'
import { useState } from 'react'
import type { Routine } from '@/store/use-app-store'
import useAppStore from '@/store/use-app-store'

interface Props {
  routine: Routine
}

export function TodayWorkoutCard({ routine }: Props){
  const [checks, setChecks] = useState<Record<string, boolean[]>>(()=>{
    const obj: Record<string, boolean[]> = {}
    routine.exercises.forEach(e=>{ obj[e.id] = Array(e.sets).fill(false) })
    return obj
  })
  const toggle = (id: string, idx: number) => {
    setChecks(c=>({ ...c, [id]: c[id].map((v,i)=> i===idx? !v : v) }))
  }
  const logSession = useAppStore(s=>s.logSession)
  const finish = () => {
    const log = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      routineId: routine.id,
      completed: true,
      exercises: routine.exercises.map(e=>({
        exerciseId: e.id,
        performedSets: checks[e.id].map((completed, idx)=>({ reps: e.reps, weight: e.weight, completed }))
      }))
    }
    logSession(log)
  }
  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-2 font-semibold">Entrenamiento de hoy - {routine.name}</h2>
      <ul className="space-y-2">
        {routine.exercises.map(ex=> (
          <li key={ex.id}>
            <p className="text-sm font-medium">{ex.name} <span className="text-xs text-muted-foreground">{ex.sets}x{ex.reps}</span></p>
            <div className="flex gap-2 mt-1">
              {checks[ex.id].map((c,i)=>(
                <button key={i} aria-label={`Serie ${i+1}`} onClick={()=>toggle(ex.id,i)}
                  className={`h-6 w-6 rounded border ${c?'bg-primary text-primary-foreground':'bg-background'}`}>{i+1}</button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <button onClick={finish} className="mt-4 w-full rounded bg-primary p-2 text-primary-foreground">Finalizar entrenamiento</button>
    </div>
  )
}
