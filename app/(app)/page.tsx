"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Activity, ChevronRight, Flame, Scale } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { useDiets } from "@/lib/firestore/diets";
import { defaultExercises } from "@/lib/data/exercises";
import { defaultRoutines } from "@/lib/data/routine-library";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { Measurement, Routine, RoutineTemplate } from "@/lib/types";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const toDayId = (date = new Date()) => {
  const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[date.getDay()];
};

const formatTrend = (current?: number | null, previous?: number | null, suffix = "") => {
  if (current == null || previous == null) return "Sin referencia";
  const delta = current - previous;
  if (Math.abs(delta) < 0.05) return "Sin cambios";
  return `${delta > 0 ? "+" : ""}${delta.toFixed(1)}${suffix}`;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const measurementPath = user?.uid ? `users/${user.uid}/measurements` : null;
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const { data: measurements } = useCol<Measurement>(measurementPath, { by: "date", dir: "desc", limit: 4 });
  const { data: templates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });
  const { data: diets } = useDiets(user?.uid);

  const routines = useMemo<Routine[]>(() => {
    const custom = (templates ?? []).map((template) => buildRoutine(template, defaultExercises));
    return mergeRoutines(custom, defaultRoutines);
  }, [templates]);

  const recentRoutines = routines.slice(0, 4);
  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const activeDiet = useMemo(() => diets.find((diet) => diet.isActive), [diets]);
  const todayCalories = useMemo(() => {
    if (!activeDiet) return null;
    const day = activeDiet.days.find((item) => item.id === toDayId());
    return day?.totalCalories ?? null;
  }, [activeDiet]);

  return (
    <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
      <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
        <section className="grid gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Flame className="h-5 w-5" />
            </div>
            <p className="text-xs text-brand-text-muted">Calorias de hoy</p>
            <p className="mt-1 text-2xl font-semibold text-brand-text-main">
              {todayCalories != null ? Math.round(todayCalories) : "--"}
            </p>
            <p className="text-xs text-brand-text-muted">kcal ingeridas</p>
          </article>

          <article className="rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Scale className="h-5 w-5" />
            </div>
            <p className="text-xs text-brand-text-muted">Ultimo peso</p>
            <p className="mt-1 text-2xl font-semibold text-brand-text-main">
              {latestMeasurement?.weightKg != null ? `${latestMeasurement.weightKg} kg` : "--"}
            </p>
            <p className="text-xs text-brand-text-muted">
              {formatTrend(latestMeasurement?.weightKg, previousMeasurement?.weightKg, " kg")}
            </p>
          </article>

          <article className="rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Activity className="h-5 w-5" />
            </div>
            <p className="text-xs text-brand-text-muted">Ultima grasa corporal</p>
            <p className="mt-1 text-2xl font-semibold text-brand-text-main">
              {latestMeasurement?.bodyFatPct != null ? `${latestMeasurement.bodyFatPct}%` : "--"}
            </p>
            <p className="text-xs text-brand-text-muted">
              {formatTrend(latestMeasurement?.bodyFatPct, previousMeasurement?.bodyFatPct, "%")}
            </p>
          </article>
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-text-main">Ultimas rutinas</h2>
            <Link href="/routines" className="text-xs font-semibold text-brand-primary">
              Ver todas
            </Link>
          </div>

          {recentRoutines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-brand-dark p-5 text-sm text-brand-text-muted">
              Aun no tienes rutinas. Crea una rutina personalizada para empezar.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recentRoutines.map((routine) => (
                <Link
                  key={routine.id}
                  href={`/routines/detail?id=${routine.id}`}
                  className="group flex items-center justify-between rounded-2xl border border-brand-border bg-brand-dark px-4 py-3 transition hover:border-brand-primary/50"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-text-main">{routine.title}</p>
                    <p className="text-xs text-brand-text-muted">
                      {routine.days.length} dias ·{" "}
                      {routine.days.reduce((total, day) => total + day.exercises.length, 0)} ejercicios
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-text-muted transition group-hover:text-brand-primary" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-text-main">Ultimas mediciones</h2>
            <Link href="/measurements" className="text-xs font-semibold text-brand-primary">
              Ver historial
            </Link>
          </div>

          {measurements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-brand-dark p-5 text-sm text-brand-text-muted">
              Todavia no hay mediciones. Registra peso y grasa para empezar tu seguimiento.
            </div>
          ) : (
            <ul className="space-y-2">
              {measurements.slice(0, 3).map((measurement) => (
                <li
                  key={measurement.id}
                  className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-dark px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-text-main">{formatDate(measurement.date)}</p>
                    <p className="text-xs text-brand-text-muted">
                      Peso: {measurement.weightKg} kg
                      {measurement.bodyFatPct != null ? ` · Grasa: ${measurement.bodyFatPct}%` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
