"use client"
import useAppStore from '@/store/use-app-store'
import { RoutineForm } from '@/components/routine-form'

export default function RoutineDetail({ params }: { params: { id: string } }){
  const routine = useAppStore(s=>s.routines.find(r=>r.id===params.id))
  return (
    <div className="p-4">
      <RoutineForm routine={routine} />
    </div>
  )
}
