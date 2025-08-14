"use client"
import { useGymStore } from "@/hooks/use-gym-store"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { RoutineForm } from "@/components/routine-form"

export default function Rutinas() {
  const { state, addRoutine, removeRoutine } = useGymStore()
  return (
    <div className="p-4 space-y-6 pb-20">
      <h1 className="text-xl font-bold">Rutinas</h1>
      <div className="space-y-4">
        {state.rutinas.map((r) => (
          <Card key={r.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{r.nombre}</CardTitle>
              <div className="space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/rutinas/${r.id}`}>Ver</Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeRoutine(r.id)}>
                  Eliminar
                </Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div>
        <h2 className="font-medium mb-2">Nueva rutina</h2>
        <RoutineForm onSave={addRoutine} />
      </div>
    </div>
  )
}
