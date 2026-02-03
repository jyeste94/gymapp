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
      <div className="space-y-6">
        <header className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Tu Progreso</h2>
          <p className="mt-2 text-sm text-[#4b5a72]">
            Visualiza tu evolucion corporal y de fuerza a lo largo del tiempo.
          </p>
        </header>

        {/* Stats Grid */}
        <StaggerContainer className="grid gap-4 md:grid-cols-3 md:gap-6 lg:gap-8">
          <StaggerItem>
            <div className="metric-card" data-variant="blue">
              <p className="metric-card__title">Entrenamientos</p>
              <p className="metric-card__value">{stats.totalWorkouts}</p>
              <p className="metric-card__helper">Sesiones completadas en total</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="metric-card" data-variant="amber">
              <p className="metric-card__title">Volumen Total</p>
              <p className="metric-card__value">{(stats.totalVolume / 1000).toFixed(1)}k</p>
              <p className="metric-card__helper">Kg movidos en total</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="metric-card" data-variant="rose">
              <p className="metric-card__title">Ultima sesion</p>
              <p className="metric-card__value text-lg">
                {stats.lastWorkoutDate ? new Date(stats.lastWorkoutDate).toLocaleDateString() : "-"}
              </p>
              <p className="metric-card__helper">Sigue asi!</p>
            </div>
          </StaggerItem>
        </StaggerContainer>



        <FadeIn delay={0.2}>
          <section className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Mapa de Calor (Esta Semana)</h3>
            <p className="text-sm text-[#4b5a72] mb-4">Intensidad de entrenamiento actual</p>
            <div className="mt-4">
              <MuscleHeatmap logs={weeklyLogs} />
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.3}>
          <section className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Composicion Corporal</h3>
            <div className="mt-4">
              {measurements.length > 0 ? (
                <MeasurementChart data={measurements} />
              ) : (
                <p className="py-10 text-center text-sm text-[#4b5a72]">
                  Registra mediciones para ver tu evolucion de peso.
                </p>
              )}
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.3}>
          <section className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Fuerza: 1RM Estimado</h3>
            <div className="mt-4">
              <StrengthChart logs={routineLogs} />
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.4}>
          <section className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Balance Muscular (Series Totales)</h3>
            <div className="mt-4">
              <MuscleVolumeChart logs={routineLogs} />
            </div>
          </section>
        </FadeIn>

        <FadeIn delay={0.5}>
          <section className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-zinc-900">Volumen Semanal</h3>
            <p className="text-xs text-zinc-500 mb-4">Total de series efectivas por semana</p>
            <div className="mt-4">
              <VolumeChart logs={routineLogs} />
            </div>
          </section>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
