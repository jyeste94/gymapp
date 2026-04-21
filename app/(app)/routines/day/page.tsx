"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, Info, Play } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { defaultExercises } from "@/lib/data/exercises";
import { defaultRoutines } from "@/lib/data/routine-library";
import { useCol } from "@/lib/firestore/hooks";
import { useExerciseLogs } from "@/lib/firestore/exercise-logs";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import { useWorkoutStore } from "@/lib/stores/workout-session";
import type { RoutineDay, RoutineExercise, RoutineLogSet, RoutineTemplate } from "@/lib/types";

const dateFormatter =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" })
    : null;

const formatDate = (iso?: string) => {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    return dateFormatter ? dateFormatter.format(date) : iso.split("T")[0];
  } catch {
    return null;
  }
};

const summarizeExercise = (exercise: RoutineExercise) =>
  `${exercise.sets} series - ${exercise.repRange} reps - descanso ${exercise.rest}`;

function RoutineDayContent() {
  const searchParams = useSearchParams();
  const routineId = searchParams.get("routineId");
  const dayId = searchParams.get("dayId");

  const { user } = useAuth();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const { data: routineTemplates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });
  const { data: routineLogs } = useWorkoutLogs(user?.uid);
  const { data: exerciseLogs } = useExerciseLogs(user?.uid);

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map((template) => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const allRoutines = useMemo(() => mergeRoutines(customRoutines, defaultRoutines), [customRoutines]);

  const routine = useMemo(
    () => allRoutines.find((entry) => entry.id === routineId) ?? null,
    [allRoutines, routineId],
  );

  const day = useMemo(
    () => routine?.days.find((entry) => entry.id === dayId) ?? null,
    [routine, dayId],
  );

  const lastSetByExercise = useMemo(() => {
    const map = new Map<string, { date: string; set: RoutineLogSet; notes?: string }>();
    if (!routine || !day || !routineLogs) return map;

    for (const log of routineLogs) {
      if (!log.routineId || log.routineId !== routine.id) continue;
      if (log.dayId && log.dayId !== day.id) continue;

      for (const entry of log.entries ?? []) {
        if (!entry.exerciseId || map.has(entry.exerciseId)) continue;
        const lastSet = entry.sets?.slice(-1)[0];
        if (!lastSet) continue;

        map.set(entry.exerciseId, {
          date: log.date,
          set: lastSet,
          notes: entry.notes ?? entry.comment,
        });
      }
    }

    return map;
  }, [routine, day, routineLogs]);

  const previousHistory = useMemo(() => {
    const map: Record<string, { weight: string; reps: string }[]> = {};
    if (!day) return map;

    const allRoutineLogs = routineLogs || [];
    const allExerciseLogs = exerciseLogs || [];

    day.exercises.forEach((exercise) => {
      const lastRoutineLog = allRoutineLogs.find((log) =>
        log.entries?.some((entry) => entry.exerciseId === exercise.id),
      );

      let bestRoutineEntry = null;
      let routineDate = 0;

      if (lastRoutineLog && lastRoutineLog.entries) {
        const entry = lastRoutineLog.entries.find((item) => item.exerciseId === exercise.id);
        if (entry) {
          bestRoutineEntry = entry;
          routineDate = new Date(lastRoutineLog.date).getTime();
        }
      }

      const lastAdHocLog = allExerciseLogs.find((log) => log.exerciseId === exercise.id);
      const adHocDate = lastAdHocLog ? new Date(lastAdHocLog.date).getTime() : 0;

      if (adHocDate > routineDate && lastAdHocLog) {
        map[exercise.id] = lastAdHocLog.sets.map((set) => ({
          weight: set.weight?.toString() ?? "",
          reps: set.reps?.toString() ?? "",
        }));
      } else if (bestRoutineEntry && bestRoutineEntry.sets) {
        map[exercise.id] = bestRoutineEntry.sets.map((set) => ({
          weight: set.weight?.toString() ?? "",
          reps: set.reps?.toString() ?? "",
        }));
      }
    });

    return map;
  }, [day, routineLogs, exerciseLogs]);

  if (!routine || !day) {
    return (
      <div className="apple-page-shell">
        <div className="apple-panel mt-8 text-center">
          <p className="sf-text-body text-apple-near-black/60 dark:text-white/60">No encontramos este dia en la rutina seleccionada.</p>
          <Link className="apple-link mt-4 inline-flex items-center gap-1" href="/routines">
            <ArrowLeft className="h-4 w-4" /> Volver a rutinas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-page-shell space-y-8">
      <header className="flex items-center gap-3">
        <Link href={`/routines/detail?id=${routine.id}`} className="text-apple-blue transition-opacity hover:opacity-80">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <span className="line-clamp-1 sf-text-subnav text-apple-near-black/60 dark:text-white/60">{routine.title}</span>
      </header>

      <section className="apple-panel relative space-y-4 overflow-hidden">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <p className="apple-kicker">Dia de {day.focus || "entrenamiento"}</p>
            <h1 className="sf-display-card-title text-apple-near-black dark:text-white">{day.title}</h1>
            {day.focus && <p className="mt-1 sf-text-body text-apple-near-black/60 dark:text-white/60">{day.focus}</p>}
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <StartWorkoutButton
              routineId={routine.id}
              routineTitle={routine.title}
              dayId={day.id}
              dayTitle={day.title}
              exercises={day.exercises}
              history={previousHistory}
            />
            <span className="sf-text-caption text-apple-near-black/55 dark:text-white/55">{day.exercises.length} ejercicios</span>
          </div>
        </div>
      </section>

      {day.notes && (
        <section className="apple-panel-muted flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-apple-blue" />
          <div>
            <p className="sf-text-body-strong text-apple-blue">Notas del dia</p>
            <p className="sf-text-body text-apple-near-black/80 dark:text-white/80">{day.notes}</p>
          </div>
        </section>
      )}

      {day.warmup && day.warmup.length > 0 && (
        <section className="apple-panel-muted">
          <h3 className="mb-4 sf-text-body-strong text-apple-near-black dark:text-white">Calentamiento</h3>
          <ul className="space-y-2 pl-2 sf-text-body text-apple-near-black/70 dark:text-white/70">
            {day.warmup.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-apple-blue">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h3 className="px-2 sf-text-body-strong text-apple-near-black dark:text-white">Entrenamiento</h3>
        <div className="space-y-4">
          {day.exercises.map((exercise) => {
            const lastRecord = lastSetByExercise.get(exercise.id);
            return (
              <ExerciseCard
                key={exercise.id}
                routineId={routine.id}
                day={day}
                exercise={exercise}
                lastRecord={lastRecord}
              />
            );
          })}
        </div>
      </section>

      {day.finisher && day.finisher.length > 0 && (
        <section className="apple-panel-muted">
          <h3 className="mb-4 sf-text-body-strong text-apple-near-black dark:text-white">Finisher</h3>
          <ul className="space-y-2 pl-2 sf-text-body text-apple-near-black/70 dark:text-white/70">
            {day.finisher.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-apple-blue">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="apple-panel text-center">
        <p className="sf-text-caption text-apple-near-black/55 dark:text-white/55">
          Selecciona un ejercicio para ver recomendaciones y guardar pesos/reps.
        </p>
      </section>
    </div>
  );
}

export default function RoutineDayPage() {
  return (
    <Suspense fallback={<div className="apple-page-shell text-center sf-text-body text-apple-near-black/60 dark:text-white/60">Cargando dia...</div>}>
      <RoutineDayContent />
    </Suspense>
  );
}

type ExerciseCardProps = {
  routineId: string;
  day: RoutineDay;
  exercise: RoutineExercise;
  lastRecord?: { date: string; set: RoutineLogSet; notes?: string };
};

function ExerciseCard({ routineId, day, exercise, lastRecord }: ExerciseCardProps) {
  const detailHref = `/exercises/detail?id=${exercise.id}&routineId=${routineId}&dayId=${day.id}`;

  return (
    <Link href={detailHref} className="group block">
      <article className="apple-panel rounded-3xl border border-apple-near-black/5 p-5 transition-colors hover:bg-apple-gray dark:border-white/5 dark:hover:bg-apple-surface-2">
        <header className="relative flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 pr-8">
            <p className="mb-1 sf-text-nano uppercase tracking-widest text-apple-blue/80">{day.title}</p>
            <h3 className="mb-1 sf-text-body-strong text-apple-near-black transition-colors group-hover:text-apple-blue dark:text-white">
              {exercise.name}
            </h3>
            <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">{summarizeExercise(exercise)}</p>
          </div>
          <ArrowLeft className="hidden h-4 w-4 rotate-135 text-apple-blue/0 transition-colors group-hover:text-apple-blue sm:block" />
        </header>

        {exercise.tip && <p className="mt-4 border-l-2 border-apple-blue/30 pl-3 sf-text-caption italic text-apple-near-black/60 dark:text-white/60">{exercise.tip}</p>}

        {lastRecord && (
          <div className="mt-5 rounded-2xl border border-apple-near-black/5 bg-apple-gray p-4 sf-text-caption dark:border-white/5 dark:bg-apple-surface-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-apple-near-black dark:text-white">
                <Calendar className="h-3 w-3 text-apple-blue" /> Ultimo registro
              </span>
              <span className="text-apple-near-black/50 dark:text-white/50">{formatDate(lastRecord.date) ?? "Fecha no disponible"}</span>
            </div>
            <div className="mt-1 inline-flex items-center gap-2 rounded-xl border border-apple-near-black/5 bg-white px-3 py-2 dark:border-white/5 dark:bg-apple-surface-1">
              <span className="font-semibold text-apple-near-black dark:text-white">{lastRecord.set.weight ? `${lastRecord.set.weight} kg` : "-"}</span>
              <span className="text-apple-near-black/30 dark:text-white/30">/</span>
              <span className="text-apple-near-black/80 dark:text-white/80">{lastRecord.set.reps ? `${lastRecord.set.reps} reps` : "-"}</span>
              {lastRecord.set.rir && (
                <>
                  <span className="text-apple-near-black/30 dark:text-white/30">/</span>
                  <span className="text-apple-near-black/60 dark:text-white/60">RIR {lastRecord.set.rir}</span>
                </>
              )}
            </div>
            {lastRecord.notes && <p className="pt-3 text-apple-near-black/60 dark:text-white/60">Notas: {lastRecord.notes}</p>}
          </div>
        )}
      </article>
    </Link>
  );
}

function StartWorkoutButton({
  routineId,
  routineTitle,
  dayId,
  dayTitle,
  exercises,
  history,
}: {
  routineId: string;
  routineTitle: string;
  dayId: string;
  dayTitle: string;
  exercises: RoutineExercise[];
  history?: Record<string, { weight: string; reps: string }[]>;
}) {
  const router = useRouter();
  const startWorkout = useWorkoutStore((state) => state.startWorkout);

  const handleStart = () => {
    startWorkout({
      routineId,
      routineTitle,
      dayId,
      dayTitle,
      exercises,
      history,
    });
    router.push("/workout/active");
  };

  return (
    <button onClick={handleStart} className="btn-apple-primary w-full md:w-auto">
      <Play className="mr-1 h-4 w-4 fill-current" /> Empezar
    </button>
  );
}
