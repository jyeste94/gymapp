"use client";
import { useMemo } from "react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { useRoutineLogs } from "@/lib/firestore/routine-logs";
import type { Measurement } from "@/lib/types";
import MeasurementChart from "@/components/measurement-chart";
import StrengthChart from "@/components/progress/strength-chart";
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/motion";

export default function ProgressPage() {
  const { user } = useAuth();

  // Fetch measurements
  const measurementPath = user?.uid ? `users/${user.uid}/measurements` : null;
  const { data: measurements } = useCol<Measurement>(measurementPath, { by: "date", dir: "asc" });

  // Fetch routine logs
  const { data: routineLogs } = useRoutineLogs(user?.uid);

  // Stats calculation
  const stats = useMemo(() => {
    const totalWorkouts = routineLogs.length;
    const lastWorkout = routineLogs[0];
    const totalVolume = routineLogs.reduce((acc, log) => {
      log.entries.forEach(e => {
        e.sets?.forEach(s => {
          const w = parseFloat(s.weight || "0");
          const r = parseFloat(s.reps || "0");
          if (s.completed) acc += w * r;
        });
      });
      return acc;
    }, 0);

    return { totalWorkouts, lastWorkoutDate: lastWorkout?.date, totalVolume };
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
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
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
      </div>
    </PageTransition>
  );
}
