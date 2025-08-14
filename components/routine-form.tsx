"use client"
import { useState } from "react"
import { createRoutine, createExercise, Routine } from "@/hooks/use-gym-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

interface Props {
  onSave: (r: Routine) => void
}

const days = ["D", "L", "M", "X", "J", "V", "S"]

export function RoutineForm({ onSave }: Props) {
  const [routine, setRoutine] = useState<Routine>(() => createRoutine(""))

  const updateExercise = (
    idx: number,
    field: keyof ReturnType<typeof createExercise>,
    value: string | number | undefined,
  ) => {
    const ejercicios = routine.ejercicios.map((ex, i) =>
      i === idx ? { ...ex, [field]: value } : ex,
    )
    setRoutine({ ...routine, ejercicios })
  }

  const addExercise = () => {
    setRoutine({ ...routine, ejercicios: [...routine.ejercicios, createExercise()] })
  }

  const toggleDay = (d: number) => {
    const dias = routine.diasSemana.includes(d)
      ? routine.diasSemana.filter((x) => x !== d)
      : [...routine.diasSemana, d]
    setRoutine({ ...routine, diasSemana: dias })
  }

  const handleSave = () => {
    if (!routine.nombre || routine.ejercicios.length === 0) return
    onSave(routine)
    setRoutine(createRoutine(""))
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Nombre de la rutina"
        value={routine.nombre}
        onChange={(e) => setRoutine({ ...routine, nombre: e.target.value })}
      />
      <div className="flex gap-2">
        {days.map((d, i) => (
          <label key={i} className="flex flex-col items-center text-xs">
            <Checkbox
              checked={routine.diasSemana.includes(i)}
              onCheckedChange={() => toggleDay(i)}
              aria-label={`día ${d}`}
            />
            {d}
          </label>
        ))}
      </div>
      {routine.ejercicios.map((e, idx) => (
        <div key={e.id} className="grid grid-cols-4 gap-2">
          <Input
            placeholder="Ejercicio"
            value={e.nombre}
            onChange={(ev) => updateExercise(idx, "nombre", ev.target.value)}
            className="col-span-2"
          />
          <Input
            type="number"
            placeholder="Series"
            value={e.series}
            onChange={(ev) => updateExercise(idx, "series", Number(ev.target.value))}
          />
          <Input
            type="number"
            placeholder="Reps"
            value={e.reps}
            onChange={(ev) => updateExercise(idx, "reps", Number(ev.target.value))}
          />
        </div>
      ))}
      <Button variant="outline" onClick={addExercise} className="w-full">
        Añadir ejercicio
      </Button>
      <Button onClick={handleSave} className="w-full">
        Guardar
      </Button>
    </div>
  )
}
