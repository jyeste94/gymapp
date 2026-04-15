"use client";
import { useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
import { useCol } from "@/lib/firestore/hooks";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { RoutineTemplate } from "@/lib/types";
import RoutineHistoryCard from "@/components/routines/routine-history-card";

const formatBadge = (label: string) => (
  <span className="rounded-full border border-brand-border bg-brand-dark px-2 py-0.5 text-xs text-brand-text-muted">
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
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const routines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const routine = useMemo(
    () => routines.find((entry) => entry.id === routineId) ?? null,
    [routines, routineId],
  );

  if (!routine) {
    return (
      <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
        <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-sm text-brand-text-muted">
            <p>No encontramos esa rutina. Vuelve al listado y selecciona una disponible.</p>
            <Link className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-primary" href="/routines">
              Volver a rutinas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Respetamos el orden original del array (definido en el template)
  const sortedDays = routine.days;
  const totalExercises = sortedDays.reduce((sum, day) => sum + day.exercises.length, 0);

  return (
    <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
      <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
        <header className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-primary/80">Rutina</p>
              <h1 className="text-2xl font-semibold text-brand-text-main">{routine.title}</h1>
              {routine.description && <p className="text-sm text-brand-text-muted">{routine.description}</p>}
            </div>
            <div className="flex flex-wrap justify-start gap-2">
              {routine.level && formatBadge(routine.level)}
              {routine.durationWeeks && formatBadge(`${routine.durationWeeks} semanas`)}
              {routine.frequency && formatBadge(routine.frequency)}
              {formatBadge(`${sortedDays.length} dias`)}
              {formatBadge(`${totalExercises} ejercicios`)}
            </div>
          </div>

          {routine.goal && (
            <div className="mt-4 rounded-xl bg-brand-primary/10 p-3 text-sm text-brand-text-main border border-brand-primary/20">
              <span className="font-semibold text-brand-primary">Objetivo:</span> {routine.goal}
            </div>
          )}

          {routine.equipment.length > 0 && (
            <p className="mt-4 text-xs text-brand-text-muted">
              Equipo sugerido: {routine.equipment.join(", ")}
            </p>
          )}

          <div className="mt-6">
            <RoutineHistoryCard routineId={routine.id} logs={routineLogs} />
          </div>
        </header>

        <section className="space-y-3">
          {sortedDays.map((day) => (
            <Link
              key={day.id}
              href={`/routines/day?routineId=${routine.id}&dayId=${day.id}`}
              className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-surface px-5 py-4 text-sm text-brand-text-muted shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-brand-primary/50"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-dark text-base font-semibold text-brand-primary">
                  {/* El campo 'order' ya no existe. Mostramos el foco del dia o un numero. */}
                  {day.focus?.charAt(0) || '#'}
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-text-main">{day.title}</p>
                  <p className="text-xs text-brand-text-muted">
                    {day.exercises.length} ejercicios
                    {day.focus ? ` | ${day.focus}` : ""}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-brand-primary">Ver dia &gt;</span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}

export default function RoutineOverviewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-brand-text-muted">Cargando rutina...</div>}>
      <RoutineOverviewContent />
    </Suspense>
  );
}

