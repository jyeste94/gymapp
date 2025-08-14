"use client"
import Link from 'next/link'
import useAppStore from '@/store/use-app-store'
import { RoutineCard } from '@/components/routine-card'

export default function RoutinesPage(){
  const routines = useAppStore(s=>s.routines)
  return (
    <div className="p-4 space-y-4">
      <Link href="/rutinas/new" className="block w-full rounded bg-primary p-2 text-center text-primary-foreground">Nueva rutina</Link>
      <div className="space-y-2">
        {routines.map(r=> <RoutineCard key={r.id} routine={r} />)}
      </div>
    </div>
  )
}
