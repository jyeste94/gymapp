export default function EjercicioDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Ejercicio {params.id}</h1>
      <p>Detalles del ejercicio.</p>
    </div>
  )
}
