import { Button } from "@/components/ui/button"

export default function RutinaDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Rutina {params.id}</h1>
      <Button>Iniciar entrenamiento</Button>
    </div>
  )
}
