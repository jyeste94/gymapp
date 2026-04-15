"use client";
import { useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { RoutineDay, RoutineExercise, RoutineTemplate, RoutineLogSet } from "@/lib/types";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
import { useExerciseLogs } from "@/lib/firestore/exercise-logs";
import { useWorkoutStore } from "@/lib/stores/workout-session";
import { Play } from "lucide-react";

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
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const allRoutines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

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
      if (!log.routineId) continue;
      if (log.routineId !== routine.id) continue;
      if (log.dayId && log.dayId !== day.id) continue;

      for (const entry of log.entries ?? []) {
        if (!entry.exerciseId) continue;
        if (map.has(entry.exerciseId)) continue;

        const lastSet = entry.sets?.slice(-1)[0];
        if (!lastSet) continue;

        map.set(entry.exerciseId, {
          date: log.date,
          set: lastSet,
          notes: entry.notes ?? entry.comment
        });
      }
    }
    return map;
  }, [routine, day, routineLogs]);

  /* 
   * Calculate previous history for pre-filling.
   * IMPROVED: Search GLOBALLY for the last time each exercise was performed, 
   * regardless of which routine it was part of (RoutineLog) or if it was ad-hoc (ExerciseLog).
   */
  const previousHistory = useMemo(() => {
    const map: Record<string, { weight: string; reps: string }[]> = {};
    if (!day) return map;

    const allRoutineLogs = routineLogs || [];
    const allExerciseLogs = exerciseLogs || [];

    day.exercises.forEach(exercise => {
      // 1. Find most recent RoutineLog for this exercise
      const lastRoutineLog = allRoutineLogs.find(log =>
        log.entries?.some(entry => entry.exerciseId === exercise.id)
      );

      let bestRoutineEntry = null;
      let routineDate = 0;

      if (lastRoutineLog && lastRoutineLog.entries) {
        const entry = lastRoutineLog.entries.find(e => e.exerciseId === exercise.id);
        if (entry) {
          bestRoutineEntry = entry;
          routineDate = new Date(lastRoutineLog.date).getTime();
        }
      }

      // 2. Find most recent ExerciseLog for this exercise
      // exerciseLogs are already sorted desc by date in the hook
      const lastAdHocLog = allExerciseLogs.find(log => log.exerciseId === exercise.id);
      const adHocDate = lastAdHocLog ? new Date(lastAdHocLog.date).getTime() : 0;

      // 3. Compare and pick the latest
      if (adHocDate > routineDate && lastAdHocLog) {
        // Use Ad-Hoc Log
        map[exercise.id] = lastAdHocLog.sets.map(s => ({
          weight: s.weight?.toString() ?? "",
          reps: s.reps?.toString() ?? ""
        }));
      } else if (bestRoutineEntry && bestRoutineEntry.sets) {
        // Use Routine Log
        map[exercise.id] = bestRoutineEntry.sets.map(s => ({
          weight: s.weight?.toString() ?? "",
          reps: s.reps?.toString() ?? ""
        }));
      }
    });

    return map;
  }, [day, routineLogs, exerciseLogs]);

  if (!routine || !day) {
    return (
      <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
        <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-sm text-brand-text-muted">
            <p>No encontramos este dia en la rutina seleccionada.</p>
            <Link className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand-primary" href="/routines">
              Volver a rutinas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
      <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
        <div className="flex items-center gap-3 text-sm text-brand-text-muted">
          <Link href={`/routines/detail?id=${routine.id}`} className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary">
            {"<- Volver a "}{routine.title}
          </Link>
        </div>

        <header className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-brand-primary/80">Dia de {day.focus}</p>
              <h1 className="text-2xl font-semibold text-brand-text-main">{day.title}</h1>
              {day.focus && <p className="mt-2 text-sm text-brand-text-muted">{day.focus}</p>}
            </div>
            <div className="flex flex-col items-end gap-3">
              <StartWorkoutButton
                routineId={routine.id}
                routineTitle={routine.title}
                dayId={day.id}
                dayTitle={day.title}
                exercises={day.exercises}
                history={previousHistory}
              />
              <div className="flex flex-col items-end gap-1 text-xs text-brand-text-muted">
                <span>{day.exercises.length} ejercicios</span>
              </div>
            </div>
          </div>
        </header>

        {
          day.notes && (
            <section className="rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-sm text-brand-text-main">
              <p className="font-semibold text-brand-primary">Notas del dia:</p>
              <p className="text-brand-text-muted">{day.notes}</p>
            </section>
          )
        }

        {
          day.warmup && day.warmup.length > 0 && (
            <section className="rounded-2xl border border-brand-border bg-brand-surface p-5">
              <h3 className="mb-3 text-sm font-semibold text-brand-primary">Calentamiento</h3>
              <ul className="space-y-1 pl-4 text-sm text-brand-text-muted marker:text-brand-primary">
                {day.warmup.map((item, i) => (
                  <li key={i} className="list-disc">{item}</li>
                ))}
              </ul>
            </section>
          )
        }

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-brand-primary">Entrenamiento</h3>
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
        </section>

        {
          day.finisher && day.finisher.length > 0 && (
            <section className="rounded-2xl border border-brand-border bg-brand-surface p-5">
              <h3 className="mb-3 text-sm font-semibold text-brand-primary">Finisher</h3>
              <ul className="space-y-1 pl-4 text-sm text-brand-text-muted marker:text-brand-primary">
                {day.finisher.map((item, i) => (
                  <li key={i} className="list-disc">{item}</li>
                ))}
              </ul>
            </section>
          )
        }

        <section className="rounded-2xl border border-brand-border bg-brand-surface p-5 text-xs text-brand-text-muted">
          <p>
            Selecciona un ejercicio para abrir su ficha completa, ver recomendaciones y registrar pesos, repeticiones y notas.
          </p>
        </section>
      </div>
    </div >
  );
}

export default function RoutineDayPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-brand-text-muted">Cargando dia...</div>}>
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
    <article className="rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-primary/80">{day.title}</p>
          <h3 className="text-base font-semibold text-brand-text-main">{exercise.name}</h3>
          <p className="text-xs text-brand-text-muted">{summarizeExercise(exercise)}</p>
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-dark px-3 py-1 text-xs font-medium text-brand-text-main hover:bg-brand-surface/80"
        >
          Abrir ejercicio
        </Link>
      </header>

      <p className="mt-3 text-sm text-brand-text-muted">{exercise.tip}</p>

      {lastRecord && (
        <div className="mt-4 rounded-2xl border border-dashed border-brand-border bg-brand-surface p-3 text-xs text-brand-text-muted">
          <p className="font-medium text-brand-text-main pb-1">Ultimo registro</p>
          <p>
            {lastRecord.set.weight ? `${lastRecord.set.weight} kg` : "-"} -
            {lastRecord.set.reps ? ` ${lastRecord.set.reps} reps` : " -"}
            {lastRecord.set.rir ? ` - RIR ${lastRecord.set.rir}` : ""}
          </p>
          <p>{formatDate(lastRecord.date) ?? "Fecha no disponible"}</p>
          {lastRecord.notes && <p className="pt-1">Notas: {lastRecord.notes}</p>}
        </div>
      )}
    </article>
  );
}

function StartWorkoutButton({
  routineId,
  routineTitle,
  dayId,
  dayTitle,
  exercises,
  history
}: {
  routineId: string,
  routineTitle: string,
  dayId: string,
  dayTitle: string,
  exercises: RoutineExercise[],
  history?: Record<string, { weight: string, reps: string }[]>
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
      history
    });
    router.push("/workout/active");
  };

  return (
    <button
      onClick={handleStart}
      className="group flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-brand-primary/50 hover:ring-offset-2 hover:ring-offset-brand-dark"
    >
      <Play className="h-4 w-4 fill-current" />
      Empieza ahora
    </button>
  );
}

