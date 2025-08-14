"use client"
import { useParams } from "next/navigation"
import { useGymStore } from "@/hooks/use-gym-store"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function RoutineDetail() {
  const params = useParams<{ id: string }>()
  const { state } = useGymStore()
  const routine = state.rutinas.find((r) => r.id === params.id)
  if (!routine) return <div className="p-4">Rutina no encontrada</div>
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">{routine.nombre}</h1>
      {routine.ejercicios.map((e) => (
        <Card key={e.id}>
          <CardHeader>
            <CardTitle>{e.nombre}</CardTitle>
          </CardHeader>
          <CardContent>
            {e.series}x{e.reps} {e.peso ? `${e.peso}kg` : ""}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
