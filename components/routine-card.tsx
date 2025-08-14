import Link from 'next/link'
import type { Routine } from '@/store/use-app-store'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function RoutineCard({ routine }: { routine: Routine }){
  return (
    <Link href={`/rutinas/${routine.id}`} className="block rounded-lg border p-4 hover:bg-accent">
      <h3 className="font-medium">{routine.name}</h3>
      <p className="text-xs text-muted-foreground">Actualizado {format(new Date(routine.updatedAt),'d MMM', { locale: es })}</p>
    </Link>
  )
}
