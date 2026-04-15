"use client";
import { useMemo } from "react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
import type { Measurement } from "@/lib/types";
import MeasurementChart from "@/components/measurement-chart";
import StrengthChart from "@/components/progress/strength-chart";
import VolumeChart from "@/components/progress/volume-chart";
import MuscleVolumeChart from "@/components/progress/muscle-volume-chart";
import MuscleHeatmap from "@/components/progress/muscle-heatmap";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/motion";
import { calculateStats } from "@/lib/stats-helpers";

export default function ProgressPage() {
  const { user } = useAuth();

  // Fetch measurements
  const measurementPath = user?.uid ? `users/${user.uid}/measurements` : null;
  const { data: measurements } = useCol<Measurement>(measurementPath, { by: "date", dir: "asc" });

  // Fetch routine logs
  const { data: routineLogs } = useWorkoutLogs(user?.uid);

  // Stats calculation
  const stats = useMemo(() => calculateStats(routineLogs), [routineLogs]);

  // Filter logs for the current week (resets on Monday)
  const weeklyLogs = useMemo(() => {
    const now = new Date();
    // Get start of the week (Monday)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    return routineLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= startOfWeek;
    });
  }, [routineLogs]);

  return (
    <PageTransition>
      <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
        <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
          <header className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text-main">Tu Progreso</h2>
            <p className="mt-2 text-sm text-brand-text-muted">
              Visualiza tu evolucion corporal y de fuerza a lo largo del tiempo.
            </p>
          </header>

          {/* Stats Grid */}
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <StaggerItem>
              <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex flex-col justify-between h-full shadow-sm">
                <p className="text-sm font-medium text-brand-text-muted">Entrenamientos</p>
                <div>
                  <p className="text-2xl font-bold text-brand-text-main mt-1">{stats.totalWorkouts}</p>
                  <p className="text-[10px] text-brand-primary mt-0.5">Sesiones totales</p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex flex-col justify-between h-full shadow-sm">
                <p className="text-sm font-medium text-brand-text-muted">Volumen Total</p>
                <div>
                  <p className="text-2xl font-bold text-brand-text-main mt-1">{(stats.totalVolume / 1000).toFixed(1)}k</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">Kg movidos</p>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem className="sm:col-span-2 md:col-span-1">
              <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex flex-col justify-between h-full shadow-sm">
                <p className="text-sm font-medium text-brand-text-muted">Ultima sesion</p>
                <div>
                  <p className="text-lg font-bold text-brand-text-main mt-1">
                    {stats.lastWorkoutDate ? new Date(stats.lastWorkoutDate).toLocaleDateString() : "-"}
                  </p>
                  <p className="text-[10px] text-brand-primary mt-0.5">Sigue asi!</p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          <FadeIn delay={0.2}>
            <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-text-main">Mapa de Calor (Esta Semana)</h3>
              <p className="text-sm text-brand-text-muted mb-4">Intensidad de entrenamiento actual</p>
              <div className="mt-4">
                <MuscleHeatmap logs={weeklyLogs} />
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.3}>
            <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-text-main">Composicion Corporal</h3>
              <div className="mt-4">
                {measurements.length > 0 ? (
                  <MeasurementChart data={measurements} />
                ) : (
                  <p className="py-10 text-center text-sm text-brand-text-muted">
                    Registra mediciones para ver tu evolucion de peso.
                  </p>
                )}
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.3}>
            <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-text-main">Fuerza: 1RM Estimado</h3>
              <div className="mt-4">
                <StrengthChart logs={routineLogs} />
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.4}>
            <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-text-main">Balance Muscular (Series)</h3>
              <div className="mt-4">
                <MuscleVolumeChart logs={routineLogs} />
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.5}>
            <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-brand-text-main">Volumen Semanal</h3>
              <p className="text-xs text-brand-text-muted mb-4">Total de series efectivas por semana</p>
              <div className="mt-4">
                <VolumeChart logs={routineLogs} />
              </div>
            </section>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
