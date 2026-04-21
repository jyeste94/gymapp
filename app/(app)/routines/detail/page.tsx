"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import RoutineHistoryCard from "@/components/routines/routine-history-card";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { defaultExercises } from "@/lib/data/exercises";
import { defaultRoutines } from "@/lib/data/routine-library";
import { useCol } from "@/lib/firestore/hooks";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { RoutineTemplate } from "@/lib/types";

const renderBadge = (label: string) => (
  <span className="rounded-full border border-apple-near-black/10 bg-apple-gray px-2.5 py-1 sf-text-nano uppercase tracking-widest text-apple-near-black/70 dark:border-white/10 dark:bg-apple-surface-2 dark:text-white/70">
    {label}
  </span>
);

function RoutineOverviewContent() {
  const searchParams = useSearchParams();
  const routineId = searchParams.get("id");

  const { user } = useAuth();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;
  const { data: routineTemplates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });
  const { data: routineLogs } = useWorkoutLogs(user?.uid);

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map((template) => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const routines = useMemo(() => mergeRoutines(customRoutines, defaultRoutines), [customRoutines]);

  const routine = useMemo(
    () => routines.find((entry) => entry.id === routineId) ?? null,
    [routines, routineId],
  );

  if (!routine) {
    return (
      <div className="apple-page-shell">
        <div className="apple-panel mt-8 space-y-3 text-center">
          <p className="sf-text-body text-apple-near-black/60 dark:text-white/60">Rutina no encontrada.</p>
          <Link className="apple-link inline-flex items-center gap-1" href="/routines">
            <ArrowLeft className="h-4 w-4" /> Volver a rutinas
          </Link>
        </div>
      </div>
    );
  }

  const sortedDays = routine.days;
  const totalExercises = sortedDays.reduce((sum, day) => sum + day.exercises.length, 0);

  return (
    <div className="apple-page-shell space-y-8">
      <header className="flex items-center gap-3">
        <Link href="/routines" className="text-apple-blue transition-opacity hover:opacity-80">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="sf-text-subnav text-apple-near-black/60 dark:text-white/60">Volver</span>
      </header>

      <section className="apple-panel space-y-5">
        <div>
          <p className="apple-kicker">Resumen</p>
          <h1 className="sf-display-card-title text-apple-near-black dark:text-white">{routine.title}</h1>
          {routine.description && <p className="mt-2 sf-text-body text-apple-near-black/60 dark:text-white/60">{routine.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {routine.level && renderBadge(routine.level)}
          {routine.durationWeeks && renderBadge(`${routine.durationWeeks} semanas`)}
          {routine.frequency && renderBadge(routine.frequency)}
          {renderBadge(`${sortedDays.length} dias`)}
          {renderBadge(`${totalExercises} ejercicios`)}
        </div>

        {routine.goal && (
          <div className="rounded-2xl border border-apple-blue/10 bg-apple-blue/5 p-4 sf-text-body">
            <span className="font-semibold text-apple-blue">Objetivo:</span>{" "}
            <span className="text-apple-near-black/80 dark:text-white/80">{routine.goal}</span>
          </div>
        )}

        {routine.equipment.length > 0 && (
          <p className="sf-text-caption text-apple-near-black/55 dark:text-white/55">Equipo sugerido: {routine.equipment.join(", ")}</p>
        )}

        <RoutineHistoryCard routineId={routine.id} logs={routineLogs} />
      </section>

      <section className="space-y-4">
        <h2 className="sf-text-body-strong px-2 text-apple-near-black dark:text-white">Dias de entrenamiento</h2>
        <div className="space-y-3">
          {sortedDays.map((day, index) => (
            <Link key={day.id} href={`/routines/day?routineId=${routine.id}&dayId=${day.id}`} className="group block">
              <article className="apple-panel rounded-2xl border border-apple-near-black/5 p-4 transition-colors hover:bg-apple-gray sm:p-5 dark:border-white/5 dark:hover:bg-apple-surface-2">
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-apple-gray text-sm font-semibold text-apple-blue dark:bg-apple-surface-2">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-1 sf-text-body-strong text-apple-near-black dark:text-white">{day.title}</p>
                        <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">{day.exercises.length} ejercicios</p>
                      </div>
                      <ChevronRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-apple-near-black/30 transition-colors group-hover:text-apple-blue dark:text-white/30" />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-apple-near-black/5 pt-3 dark:border-white/5">
                      <span className="line-clamp-1 sf-text-nano uppercase tracking-widest text-apple-blue">{day.focus || "General"}</span>
                      <span className="sf-text-link text-apple-blue">Ver detalle</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function RoutineOverviewPage() {
  return (
    <Suspense fallback={<div className="apple-page-shell text-center sf-text-body text-apple-near-black/60 dark:text-white/60">Cargando rutina...</div>}>
      <RoutineOverviewContent />
    </Suspense>
  );
}
