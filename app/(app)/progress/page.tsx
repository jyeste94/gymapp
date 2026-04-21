"use client";

import { useMemo, type ReactNode } from "react";
import { Activity, Dumbbell, Flame, TrendingUp, Zap } from "lucide-react";
import MuscleHeatmap from "@/components/progress/muscle-heatmap";
import MuscleVolumeChart from "@/components/progress/muscle-volume-chart";
import StrengthChart from "@/components/progress/strength-chart";
import VolumeChart from "@/components/progress/volume-chart";
import { FadeIn, PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/motion";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
import { calculateStats } from "@/lib/stats-helpers";

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

    return routineLogs.filter((log) => new Date(log.date) >= startOfWeek);
  }, [routineLogs]);

  return (
    <PageTransition>
      <div className="apple-page-shell space-y-8">
        <header className="mb-8 flex flex-col gap-2">
          <p className="apple-kicker">Progreso</p>
          <h1 className="sf-display-hero text-apple-near-black dark:text-white">Analisis de rendimiento</h1>
          <p className="max-w-xl sf-text-subnav text-apple-near-black/60 dark:text-white/60">
            Tu evolucion en numeros. Analiza fuerza, volumen y equilibrio muscular.
          </p>
        </header>

        <StaggerContainer className="grid gap-4 sm:grid-cols-3">
          <StaggerItem>
            <StatCard title="Sesiones" value={stats.totalWorkouts.toString()} subtitle="Completadas" icon={<Zap className="h-5 w-5" />} color="text-apple-blue" bg="bg-apple-blue/10" />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Volumen total"
              value={`${(stats.totalVolume / 1000).toFixed(1)}k`}
              subtitle="Kg movidos"
              icon={<Dumbbell className="h-5 w-5" />}
              color="text-[#34C759]"
              bg="bg-[#34C759]/10"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Ultimo esfuerzo"
              value={stats.lastWorkoutDate ? new Date(stats.lastWorkoutDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }) : "-"}
              subtitle="Manten el ritmo"
              icon={<Flame className="h-5 w-5" />}
              color="text-[#FF3B30]"
              bg="bg-[#FF3B30]/10"
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <section className="apple-panel p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Activity className="h-6 w-6 text-apple-blue" />
                  <div>
                    <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">Impacto muscular semanal</h3>
                    <p className="sf-text-caption text-apple-near-black/50 dark:text-white/50">Intensidad por grupo muscular</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-apple-gray p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
                  <MuscleHeatmap logs={weeklyLogs} />
                </div>
              </section>
            </FadeIn>
          </div>

          <FadeIn delay={0.3}>
            <section className="apple-panel flex h-full flex-col p-8">
              <div className="mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-apple-blue" />
                <div>
                  <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">Fuerza 1RM</h3>
                  <p className="sf-text-caption text-apple-near-black/50 dark:text-white/50">Estimacion de repeticion maxima</p>
                </div>
              </div>
              <div className="min-h-[300px] flex-1 rounded-3xl bg-apple-gray p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
                <StrengthChart logs={routineLogs} />
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.4}>
            <section className="apple-panel flex h-full flex-col p-8">
              <div className="mb-6 flex items-center gap-3">
                <Dumbbell className="h-6 w-6 text-apple-blue" />
                <div>
                  <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">Balance muscular</h3>
                  <p className="sf-text-caption text-apple-near-black/50 dark:text-white/50">Distribucion historica de series</p>
                </div>
              </div>
              <div className="min-h-[300px] flex-1 rounded-3xl bg-apple-gray p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
                <MuscleVolumeChart logs={routineLogs} />
              </div>
            </section>
          </FadeIn>

          <div className="lg:col-span-2">
            <FadeIn delay={0.5}>
              <section className="apple-panel p-8">
                <div className="mb-6 flex items-center gap-3">
                  <Zap className="h-6 w-6 text-apple-blue" />
                  <div>
                    <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">Evolucion de volumen</h3>
                    <p className="sf-text-caption text-apple-near-black/50 dark:text-white/50">Total de series efectivas por semana</p>
                  </div>
                </div>
                <div className="rounded-3xl bg-apple-gray p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
                  <VolumeChart logs={routineLogs} />
                </div>
              </section>
            </FadeIn>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  bg,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <div className="apple-panel flex h-full flex-col justify-between p-6 transition-transform duration-300 hover:scale-[1.02]">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bg} ${color}`}>{icon}</div>
        <p className="sf-text-nano uppercase tracking-widest text-apple-near-black/50 dark:text-white/50">{title}</p>
      </div>
      <div>
        <p className="sf-display-card-title text-apple-near-black dark:text-white">{value}</p>
        <p className={`mt-1 sf-text-nano font-semibold uppercase tracking-widest ${color}`}>{subtitle}</p>
      </div>
    </div>
  );
}
