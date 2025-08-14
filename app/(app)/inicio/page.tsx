import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InicioPage() {
  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Entrenamiento de hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No hay sesión programada.</p>
        </CardContent>
      </Card>
    </div>
  )
}
