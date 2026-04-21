"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Activity, ChevronRight, Flame, Scale, Zap } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { useDiets } from "@/lib/firestore/diets";
import { defaultExercises } from "@/lib/data/exercises";
import { defaultRoutines } from "@/lib/data/routine-library";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { Measurement, Routine, RoutineTemplate } from "@/lib/types";

const toDayId = (date = new Date()) => {
  const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[date.getDay()];
};

const formatTrend = (current?: number | null, previous?: number | null, suffix = "") => {
  if (current == null || previous == null) return { text: "Sin cambios", color: "text-apple-near-black/60 dark:text-white/60" };
  const delta = current - previous;
  if (Math.abs(delta) < 0.05) return { text: "Estable", color: "text-apple-near-black/60 dark:text-white/60" };
  const isPositive = delta > 0;
  return {
    text: `${isPositive ? "+" : ""}${delta.toFixed(1)}${suffix}`,
    color: isPositive ? "text-apple-near-black dark:text-white" : "text-apple-blue",
  };
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

  const weightTrend = formatTrend(latestMeasurement?.weightKg, previousMeasurement?.weightKg, "kg");

  return (
    <div className="apple-page-shell space-y-10">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="apple-kicker">Inicio</p>
          <h1 className="sf-display-hero text-apple-near-black dark:text-white">Hola, {user?.displayName?.split(" ")[0] || "Campeon"}</h1>
          <p className="sf-text-subnav mt-1 text-apple-near-black/60 dark:text-white/60">Tu resumen semanal de entrenamiento y nutricion.</p>
        </div>
        <Link href="/routines" className="btn-apple-primary self-start md:self-auto">
          <Zap className="h-5 w-5" /> Entrenar ahora
        </Link>
      </header>

      <section className="grid gap-6 sm:grid-cols-3">
        <article className="apple-panel flex min-h-[140px] flex-col justify-between rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apple-blue/10 text-apple-blue">
              <Flame className="h-5 w-5" />
            </div>
            <p className="apple-kicker">Energia</p>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="sf-display-section tracking-tight text-apple-near-black dark:text-white">{todayCalories != null ? Math.round(todayCalories) : "0"}</span>
            <span className="sf-text-body text-apple-near-black/60 dark:text-white/60">kcal</span>
          </div>
        </article>

        <article className="apple-panel flex min-h-[140px] flex-col justify-between rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apple-blue/10 text-apple-blue">
              <Scale className="h-5 w-5" />
            </div>
            <p className="apple-kicker">Peso</p>
          </div>
          <div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="sf-display-section tracking-tight text-apple-near-black dark:text-white">{latestMeasurement?.weightKg != null ? latestMeasurement.weightKg : "--"}</span>
              <span className="sf-text-body text-apple-near-black/60 dark:text-white/60">kg</span>
            </div>
            <p className={`sf-text-micro mt-1 font-medium ${weightTrend.color}`}>{weightTrend.text} esta semana</p>
          </div>
        </article>

        <article className="apple-panel flex min-h-[140px] flex-col justify-between rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-apple-blue/10 text-apple-blue">
              <Activity className="h-5 w-5" />
            </div>
            <p className="apple-kicker">Fisico</p>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="sf-display-section tracking-tight text-apple-near-black dark:text-white">
              {latestMeasurement?.bodyFatPct != null ? `${latestMeasurement.bodyFatPct}%` : "--"}
            </span>
          </div>
          <p className="sf-text-micro mt-1 text-apple-near-black/60 dark:text-white/60">Grasa corporal</p>
        </article>
      </section>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="apple-panel p-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="sf-display-card-title text-apple-near-black dark:text-white">Tus rutinas</h2>
            <Link href="/routines" className="btn-apple-pill hidden md:inline-flex">
              Ver todas <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4">
            {recentRoutines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-apple-near-black/20 p-8 text-center dark:border-white/20">
                <p className="sf-text-body text-apple-near-black/60 dark:text-white/60">Aun sin plan</p>
                <Link href="/routines" className="apple-link mt-4 inline-flex items-center gap-1">
                  Crear primera rutina <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              recentRoutines.map((routine) => (
                <Link
                  key={routine.id}
                  href={`/routines/detail?id=${routine.id}`}
                  className="group flex flex-col gap-2 rounded-2xl bg-apple-gray p-5 transition-colors hover:bg-apple-blue/5 dark:bg-apple-surface-2"
                >
                  <div className="flex w-full items-center justify-between">
                    <p className="sf-text-body-strong text-apple-near-black dark:text-white">{routine.title}</p>
                    <ChevronRight className="h-5 w-5 text-apple-near-black/30 transition-colors group-hover:text-apple-blue dark:text-white/30" />
                  </div>
                  <p className="sf-text-micro text-apple-near-black/60 dark:text-white/60">
                    {routine.days.length} dias - {routine.days.reduce((total, day) => total + day.exercises.length, 0)} ejercicios
                  </p>
                </Link>
              ))
            )}

            <Link href="/routines" className="apple-link mt-4 text-center md:hidden">
              Ver todas las rutinas
            </Link>
          </div>
        </section>

        <section className="rounded-3xl bg-apple-near-black p-8 shadow-apple-card dark:bg-[#1a1a1c]">
          <div className="mb-8">
            <h2 className="sf-display-card-title text-white">Tu actividad</h2>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
            <div className="relative mb-6 flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full rotate-[-90deg]">
                <circle cx="80" cy="80" r="70" className="fill-none stroke-white/10" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" className="fill-none stroke-apple-link-dark" strokeWidth="12" strokeDasharray="439.8" strokeDashoffset="110" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="sf-display-tile text-white">75%</span>
              </div>
            </div>
            <p className="sf-text-body max-w-[220px] text-white/80">Has completado el 75% de tu objetivo semanal.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
