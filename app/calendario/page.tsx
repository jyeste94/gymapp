"use client"
import { useGymStore } from "@/hooks/use-gym-store"
import { CalendarMini } from "@/components/calendar-mini"

export default function Calendario() {
  const { state } = useGymStore()
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Calendario</h1>
      <CalendarMini history={state.historial} />
    </div>
  )
}
