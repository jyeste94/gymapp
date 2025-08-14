import { addDays, isSameDay, startOfWeek } from 'date-fns'
import type { SessionLog } from '@/store/use-app-store'

export function weekBars(logs: SessionLog[]): number[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  return Array.from({length:7}).map((_,i)=>{
    const d = addDays(start, i)
    return logs.some(l=>l.completed && isSameDay(new Date(l.date), d)) ? 1 : 0
  })
}

export function computeStreak(logs: SessionLog[]): { streak: number; best: number } {
  const sorted = [...logs].sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime())
  let streak=0,best=0
  for(let i=0;i<sorted.length;i++){
    const cur = new Date(sorted[i].date)
    const prev = i>0 ? new Date(sorted[i-1].date) : null
    if(prev && (cur.getTime() - prev.getTime() === 86400000)) streak++
    else streak = 1
    if(streak>best) best = streak
  }
  return { streak, best }
}
