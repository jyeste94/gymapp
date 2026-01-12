"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import {
  defaultRoutines,
  mergeRoutines,
  templateToRoutineDefinition,
  createRoutineAliasIndex,
  type RoutineTemplateDoc,
  type RoutineDayDefinition,
} from "@/lib/data/routine-library";
import { useRoutineLogs, type RoutineLogSet } from "@/lib/firestore/routine-logs";
import type { RoutineExercise } from "@/lib/data/routine-plan";
import { useWorkoutStore } from "@/lib/stores/workout-session";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const { data: routineTemplates } = useCol<RoutineTemplateDoc>(templatesPath, { by: "title", dir: "asc" });
  const { data: routineLogs } = useRoutineLogs(user?.uid);

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(templateToRoutineDefinition),
    [routineTemplates],
  );

  const routines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const routine = useMemo(
    () => routines.find((entry) => entry.id === params.routineId) ?? null,
    [routines, params.routineId],
  );

  const day = useMemo(
    () => routine?.days.find((entry) => entry.id === params.dayId) ?? null,
    [routine, params.dayId],
  );

  const aliasIndex = useMemo(() => createRoutineAliasIndex(routines), [routines]);

  const lastSetByExercise = useMemo(() => {
    const map = new Map<string, { date: string; set: RoutineLogSet; notes?: string }>();
    if (!routine || !day || !routineLogs) return map;

    for (const log of routineLogs) {
      const routineMatch = log.routineId || log.routineName || log.dayId || log.dayName || log.day;
      if (!routineMatch) continue;
      const alias = aliasIndex.get(routineMatch.trim().toLowerCase());
      if (!alias || alias.routine.id !== routine.id) continue;
      if (alias.day && alias.day.id !== day.id) continue;

      for (const entry of log.entries ?? []) {
        const key = entry.exerciseId || entry.exerciseName || "";
        if (!key) continue;
        const normalized = key.toLowerCase();
        if (map.has(normalized)) continue;
        const sets = entry.sets?.length ? entry.sets : undefined;
        const fallback = entry.weight || entry.reps || entry.rir || entry.comment
          ? [{
            weight: entry.weight,
            reps: entry.reps,
            rir: entry.rir,
            comment: entry.comment,
            notes: entry.notes,
          }]
          : undefined;
        const chosen = sets?.[sets.length - 1] ?? fallback?.[fallback.length - 1];
        if (!chosen) continue;
        map.set(normalized, { date: log.date, set: chosen, notes: entry.notes ?? entry.comment });
      }
    }

    return map;
  }, [routine, day, routineLogs, aliasIndex]);

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
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Dia {day.order}</p>
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
              {day.intensity && <span>Intensidad: {day.intensity}</span>}
              {day.estimatedDuration && <span>Duracion estimada: {day.estimatedDuration}</span>}
              <span>{day.exercises.length} ejercicios</span>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Calentamiento sugerido" items={day.warmup} />
        <InfoCard title="Finaliza con" items={day.finisher.length ? day.finisher : ["Estiramientos ligeros", "Respiracion controlada"]} />
      </section>

      <section className="space-y-3">
        {day.exercises.map((exercise) => {
          const lastRecord = lastSetByExercise.get(exercise.id.toLowerCase());
          return (
            <ExerciseCard
              key={exercise.id}
              day={day}
              exercise={exercise}
              lastRecord={lastRecord}
            />
          );
        })}
      </section>

      <section className="rounded-2xl border border-[rgba(10,46,92,0.18)] bg-white/80 p-5 text-xs text-[#51607c]">
        <p>
          Selecciona un ejercicio para abrir su ficha completa, ver recomendaciones y registrar pesos, repeticiones y notas.
        </p>
      </section>
    </div>
  );
}

type InfoCardProps = {
  title: string;
  items: string[];
};

function InfoCard({ title, items }: InfoCardProps) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-[rgba(10,46,92,0.16)] bg-white/80 p-4">
      <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-[#4b5a72]">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[rgba(10,46,92,0.45)]" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type ExerciseCardProps = {
  day: RoutineDayDefinition;
  exercise: RoutineExercise;
  lastRecord?: { date: string; set: RoutineLogSet; notes?: string };
};

function ExerciseCard({ day, exercise, lastRecord }: ExerciseCardProps) {
  const detailHref = `/exercises/${exercise.id}`;
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

