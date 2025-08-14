import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { SessionLog } from '@/store/use-app-store'

interface Props {
  logs: SessionLog[]
}

export function CalendarMonth({ logs }: Props){
  const now = new Date()
  const start = startOfWeek(startOfMonth(now), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(now), { weekStartsOn: 1 })
  const days: Date[] = []
  for(let d=start; d<=end; d=addDays(d,1)) days.push(d)
  return (
    <div className="grid grid-cols-7 gap-1 text-center text-sm">
      {['L','M','X','J','V','S','D'].map(d=>(<div key={d} className="font-medium">{d}</div>))}
      {days.map((d,i)=>{
        const logged = logs.find(l=>l.completed && isSameDay(new Date(l.date), d))
        return (
          <div key={i} className={`h-10 w-10 rounded-full flex items-center justify-center ${!isSameMonth(d,now)?'text-muted-foreground':''} ${logged?'bg-primary text-primary-foreground':''}`}>{format(d,'d',{locale:es})}</div>
        )
      })}
    </div>
  )
}
