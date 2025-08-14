'use client'
import { useState } from 'react'
import type { Routine, Exercise, DayOfWeek } from '@/store/use-app-store'
import useAppStore from '@/store/use-app-store'
import { v4 as uuid } from 'uuid'

interface Props {
  routine?: Routine
}

const emptyExercise = (): Exercise => ({ id: uuid(), name:'', sets:3, reps:10 })

export function RoutineForm({ routine }: Props){
  const addRoutine = useAppStore(s=>s.addRoutine)
  const updateRoutine = useAppStore(s=>s.updateRoutine)
  const [name, setName] = useState(routine?.name ?? '')
  const [days, setDays] = useState<DayOfWeek[]>(routine?.days ?? [1])
  const [exercises, setExercises] = useState<Exercise[]>(routine?.exercises ?? [emptyExercise()])

  const submit = () => {
    if(!name || exercises.length===0) return alert('Nombre y ejercicios obligatorios')
    const r: Routine = {
      id: routine?.id ?? uuid(),
      name,
      days,
      exercises,
      updatedAt: new Date().toISOString()
    }
    routine ? updateRoutine(r) : addRoutine(r)
  }

  const toggleDay = (d: DayOfWeek) => {
    setDays(prev=> prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d])
  }

  return (
    <div className="space-y-4">
      <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded border p-2" placeholder="Nombre de rutina" />
      <div className="flex gap-2">
        {[1,2,3,4,5,6,7].map(d=>(
          <button key={d} onClick={()=>toggleDay(d as DayOfWeek)} className={`h-8 w-8 rounded border ${days.includes(d as DayOfWeek)?'bg-primary text-primary-foreground':''}`}>{d}</button>
        ))}
      </div>
      <div className="space-y-2">
        {exercises.map((ex,i)=>(
          <div key={ex.id} className="flex gap-2">
            <input value={ex.name} onChange={e=>setExercises(arr=> arr.map((x,j)=> j===i?{...x,name:e.target.value}:x))} className="flex-1 rounded border p-1" placeholder="Ejercicio" />
            <input type="number" value={ex.sets} onChange={e=>setExercises(arr=> arr.map((x,j)=> j===i?{...x,sets:+e.target.value}:x))} className="w-16 rounded border p-1" aria-label="series" />
            <input type="number" value={ex.reps} onChange={e=>setExercises(arr=> arr.map((x,j)=> j===i?{...x,reps:+e.target.value}:x))} className="w-16 rounded border p-1" aria-label="reps" />
          </div>
        ))}
        <button onClick={()=>setExercises(e=>[...e, emptyExercise()])} className="rounded border px-2 py-1 text-sm">Añadir ejercicio</button>
      </div>
      <button onClick={submit} className="w-full rounded bg-primary p-2 text-primary-foreground">Guardar</button>
    </div>
  )
}
