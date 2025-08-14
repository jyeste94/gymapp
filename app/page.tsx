"use client"
import { useGymStore } from "@/hooks/use-gym-store"
import { ProgressBarWeekly } from "@/components/progress-bar-weekly"
import { StreakBadge } from "@/components/streak-badge"
import { WorkoutCard } from "@/components/workout-card"

export default function Dashboard() {
  const { todayRoutine, daysThisWeek, streak, state, toggleSet, finishWorkout } = useGymStore()
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long" })
  const progress = state.progreso[new Date().toISOString().split("T")[0]] || {}

  return (
    <div className="p-4 space-y-6">
      <section>
        <h1 className="text-xl font-bold">Hola, {state.usuario.nombre}</h1>
      </section>
      <section>
        <h2 className="mb-2 font-medium">Esta semana</h2>
        <ProgressBarWeekly days={daysThisWeek} />
      </section>
      <section className="flex items-center gap-2">
        <StreakBadge streak={streak} />
        <span className="text-sm text-muted-foreground">
          {daysThisWeek.filter(Boolean).length}/{state.usuario.metaSemanal} entrenamientos
        </span>
      </section>
      <section>
        <h2 className="mb-2 font-medium capitalize">Entrenamiento de hoy ({today})</h2>
        {todayRoutine ? (
          <WorkoutCard
            routine={todayRoutine}
            progress={progress}
            onToggle={toggleSet}
            onFinish={finishWorkout}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Hoy no hay entrenamiento planificado.</p>
        )}
      </section>
    </div>
  )
}
