"use client"
import useAppStore from '@/store/use-app-store'
import { WeeklyProgressBar } from '@/components/weekly-progress-bar'
import { StreakBadge } from '@/components/streak-badge'
import { TodayWorkoutCard } from '@/components/today-workout-card'

export default function DashboardPage(){
  const routine = useAppStore(s=>s.getTodayRoutine())
  const stats = useAppStore(s=>s.getWeekStats())
  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-xl font-bold">Hola, {useAppStore.getState().profile.name}</h1>
        <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('es-ES',{weekday:'long', day:'numeric', month:'long'})}</p>
      </header>
      <section className="rounded-lg border p-4">
        <h2 className="mb-2 text-sm font-medium">Días entrenados esta semana</h2>
        <WeeklyProgressBar bars={stats.bars} />
      </section>
      {routine && <TodayWorkoutCard routine={routine} />}
      <StreakBadge streak={stats.streak} best={stats.bestStreak} />
    </div>
  )
}
