"use client"
import useAppStore from '@/store/use-app-store'
import { CalendarMonth } from '@/components/calendar-month'

export default function CalendarPage(){
  const logs = useAppStore(s=>s.sessionLogs)
  return (
    <div className="p-4">
      <CalendarMonth logs={logs} />
    </div>
  )
}
