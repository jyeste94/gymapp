"use client";
import { useMemo } from "react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
import StrengthChart from "@/components/progress/strength-chart";
import VolumeChart from "@/components/progress/volume-chart";
import MuscleVolumeChart from "@/components/progress/muscle-volume-chart";
import MuscleHeatmap from "@/components/progress/muscle-heatmap";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/motion";
import { calculateStats } from "@/lib/stats-helpers";
import { Activity, Zap, TrendingUp, Dumbbell, Flame } from "lucide-react";

export default function ProgressPage() {
  const { user } = useAuth();
  const { data: routineLogs } = useWorkoutLogs(user?.uid);
  const stats = useMemo(() => calculateStats(routineLogs), [routineLogs]);

  const weeklyLogs = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    return routineLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startOfWeek;
    });
  }, [routineLogs]);

  return (
    <PageTransition>
      <div className="relative min-h-screen pb-32 pt-6 lg:pb-12">
        <div className="relative z-10 space-y-8 px-5 lg:px-0">
          <header className="flex flex-col gap-2">
            <h1 className="font-bebas text-4xl uppercase text-brand-text-main md:text-5xl">
              Análisis de <span className="text-brand-primary text-glow-primary">Rendimiento</span>
            </h1>
            <p className="text-sm text-brand-text-muted max-w-xl">
              Tu evolución en números. Analiza tu fuerza, volumen y composición corporal.
            </p>
          </header>

          {/* Stats Grid */}
          <StaggerContainer className="grid gap-4 sm:grid-cols-3">
            <StaggerItem>
              <div className="glass-card rounded-3xl p-5 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Sesiones</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-brand-text-main">{stats.totalWorkouts}</p>
                  <p className="text-[10px] text-brand-primary mt-1 uppercase tracking-wider font-bold">Completadas</p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-card rounded-3xl p-5 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Dumbbell className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Volumen Total</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-brand-text-main">{(stats.totalVolume / 1000).toFixed(1)}<span className="text-xl">k</span></p>
                  <p className="text-[10px] text-emerald-400 mt-1 uppercase tracking-wider font-bold">Kg Movidos</p>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-card rounded-3xl p-5 flex flex-col justify-between h-full">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                    <Flame className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Último Esfuerzo</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-text-main">
                    {stats.lastWorkoutDate ? new Date(stats.lastWorkoutDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : "-"}
                  </p>
                  <p className="text-[10px] text-rose-400 mt-1 uppercase tracking-wider font-bold">Mantén el ritmo</p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <FadeIn delay={0.2}>
                <section className="glass-card rounded-4xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="h-6 w-6 text-brand-primary" />
                    <div>
                      <h3 className="text-xl font-bold text-brand-text-main">Impacto Muscular Semanal</h3>
                      <p className="text-xs text-brand-text-muted">Intensidad por grupo muscular (Esta Semana)</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-brand-dark/50 border border-brand-border/50 p-4">
                    <MuscleHeatmap logs={weeklyLogs} />
                  </div>
                </section>
              </FadeIn>
            </div>

            <FadeIn delay={0.3}>
              <section className="glass-card rounded-4xl p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-6 w-6 text-brand-primary" />
                  <div>
                    <h3 className="text-xl font-bold text-brand-text-main">Fuerza 1RM</h3>
                    <p className="text-xs text-brand-text-muted">Estimación de repetición máxima</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-brand-dark/50 border border-brand-border/50 p-4 h-[300px]">
                  <StrengthChart logs={routineLogs} />
                </div>
              </section>
            </FadeIn>

            <FadeIn delay={0.4}>
              <section className="glass-card rounded-4xl p-6 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <Dumbbell className="h-6 w-6 text-brand-primary" />
                  <div>
                    <h3 className="text-xl font-bold text-brand-text-main">Balance Muscular</h3>
                    <p className="text-xs text-brand-text-muted">Distribución histórica de series</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-brand-dark/50 border border-brand-border/50 p-4 h-[300px]">
                  <MuscleVolumeChart logs={routineLogs} />
                </div>
              </section>
            </FadeIn>

            <div className="lg:col-span-2">
              <FadeIn delay={0.5}>
                <section className="glass-card rounded-4xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="h-6 w-6 text-brand-primary" />
                    <div>
                      <h3 className="text-xl font-bold text-brand-text-main">Evolución de Volumen</h3>
                      <p className="text-xs text-brand-text-muted">Total de series efectivas por semana</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-brand-dark/50 border border-brand-border/50 p-4">
                    <VolumeChart logs={routineLogs} />
                  </div>
                </section>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
