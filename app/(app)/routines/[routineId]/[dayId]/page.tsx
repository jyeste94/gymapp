"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { RoutineDay, RoutineExercise, RoutineTemplate, RoutineLogSet } from "@/lib/types";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
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

export default function RoutineDayPage() {
  const params = useParams<{ routineId: string; dayId: string }>();
  const { user } = useAuth();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const { data: routineTemplates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });
  const { data: routineLogs } = useWorkoutLogs(user?.uid);

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const allRoutines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const routine = useMemo(
    () => allRoutines.find((entry) => entry.id === params.routineId) ?? null,
    [allRoutines, params.routineId],
  );

  const day = useMemo(
    () => routine?.days.find((entry) => entry.id === params.dayId) ?? null,
    [routine, params.dayId],
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

  if (!routine || !day) {
    return (
      <div className="rounded-2xl border border-[rgba(10,46,92,0.18)] bg-white/80 p-6 text-sm text-[#4b5a72]">
        <p>No encontramos este dia en la rutina seleccionada.</p>
        <Link className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#4b5a72]" href="/routines">
          Volver a rutinas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-[#51607c]">
        <Link href={`/routines/${routine.id}`} className="inline-flex items-center gap-2 text-xs font-semibold text-[#4b5a72]">
          {"<- Volver a "}{routine.title}
        </Link>
      </div>

      <header className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Día de {day.focus}</p>
            <h1 className="text-2xl font-semibold text-zinc-900">{day.title}</h1>
            {day.focus && <p className="mt-2 text-sm text-[#4b5a72]">{day.focus}</p>}
          </div>
          <div className="flex flex-col items-end gap-3">
            <StartWorkoutButton
              routineId={routine.id}
              routineTitle={routine.title}
              dayId={day.id}
              dayTitle={day.title}
              exercises={day.exercises}
            />
            <div className="flex flex-col items-end gap-1 text-xs text-[#51607c]">
              <span>{day.exercises.length} ejercicios</span>
            </div>
          </div>
        </div>
      </header>

      {
        day.notes && (
          <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-[#0a2e5c]">
            <p className="font-semibold">Notas del día:</p>
            <p>{day.notes}</p>
          </section>
        )
      }

      {
        day.warmup && day.warmup.length > 0 && (
          <section className="rounded-2xl border border-[rgba(10,46,92,0.16)] bg-white/80 p-5">
            <h3 className="mb-3 text-sm font-semibold text-[#0a2e5c]">Calentamiento</h3>
            <ul className="space-y-1 pl-4 text-sm text-[#4b5a72] marker:text-[#0a2e5c]">
              {day.warmup.map((item, i) => (
                <li key={i} className="list-disc">{item}</li>
              ))}
            </ul>
          </section>
        )
      }

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[#0a2e5c]">Entrenamiento</h3>
        {day.exercises.map((exercise) => {
          const lastRecord = lastSetByExercise.get(exercise.id.toLowerCase());
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
          <section className="rounded-2xl border border-[rgba(10,46,92,0.16)] bg-white/80 p-5">
            <h3 className="mb-3 text-sm font-semibold text-[#0a2e5c]">Finisher</h3>
            <ul className="space-y-1 pl-4 text-sm text-[#4b5a72] marker:text-[#0a2e5c]">
              {day.finisher.map((item, i) => (
                <li key={i} className="list-disc">{item}</li>
              ))}
            </ul>
          </section>
        )
      }

      <section className="rounded-2xl border border-[rgba(10,46,92,0.18)] bg-white/80 p-5 text-xs text-[#51607c]">
        <p>
          Selecciona un ejercicio para abrir su ficha completa, ver recomendaciones y registrar pesos, repeticiones y notas.
        </p>
      </section>
    </div >
  );
}

type ExerciseCardProps = {
  routineId: string;
  day: RoutineDay;
  exercise: RoutineExercise;
  lastRecord?: { date: string; set: RoutineLogSet; notes?: string };
};

function ExerciseCard({ routineId, day, exercise, lastRecord }: ExerciseCardProps) {
  const detailHref = `/exercises/${exercise.id}?routineId=${routineId}&dayId=${day.id}`;
  return (
    <article className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{day.title}</p>
          <h3 className="text-base font-semibold text-zinc-900">{exercise.name}</h3>
          <p className="text-xs text-[#51607c]">{summarizeExercise(exercise)}</p>
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(10,46,92,0.24)] bg-white/70 px-3 py-1 text-xs font-medium text-[#4b5a72]"
        >
          Abrir ejercicio
        </Link>
      </header>

      <p className="mt-3 text-sm text-[#4b5a72]">{exercise.tip}</p>

      {lastRecord && (
        <div className="mt-4 rounded-2xl border border-dashed border-[rgba(10,46,92,0.24)] bg-white/70 px-3 py-2 text-xs text-[#51607c]">
          <p className="font-medium text-[#4b5a72]">Ultimo registro</p>
          <p>
            {lastRecord.set.weight ? `${lastRecord.set.weight} kg` : "-"} -
            {lastRecord.set.reps ? ` ${lastRecord.set.reps} reps` : " -"}
            {lastRecord.set.rir ? ` - RIR ${lastRecord.set.rir}` : ""}
          </p>
          <p>{formatDate(lastRecord.date) ?? "Fecha no disponible"}</p>
          {lastRecord.notes && <p>Notas: {lastRecord.notes}</p>}
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
  exercises
}: {
  routineId: string,
  routineTitle: string,
  dayId: string,
  dayTitle: string,
  exercises: RoutineExercise[]
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
    });
    router.push("/workout/active");
  };

  return (
    <button
      onClick={handleStart}
      className="group flex items-center gap-2 rounded-full bg-[#0a2e5c] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#0a2e5c] hover:ring-offset-2"
    >
      <Play className="h-4 w-4 fill-current" />
      Empieza ahora
    </button>
  );
}
