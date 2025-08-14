"use client"
import { useGymStore } from "@/hooks/use-gym-store"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export default function Perfil() {
  const { state, updateGoal, reset } = useGymStore()
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Perfil</h1>
      <div>
        <p className="mb-2">Meta semanal: {state.usuario.metaSemanal} días</p>
        <Slider
          max={7}
          min={1}
          step={1}
          value={[state.usuario.metaSemanal]}
          onValueChange={(v) => updateGoal(v[0])}
        />
      </div>
      <Button variant="destructive" onClick={reset}>
        Reiniciar datos
      </Button>
    </div>
  )
}
