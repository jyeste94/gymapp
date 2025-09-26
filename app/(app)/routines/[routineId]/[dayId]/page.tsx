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
import type { RoutineExercise } from "@/lib/data/routine-plan";

type RoutineLogSet = {
  weight?: string;
  reps?: string;
  rir?: string;
  comment?: string;
  notes?: string;
  completed?: boolean;
};

type StoredRoutineLog = {
  id: string;
  date: string;
  routineId?: string;
  routineName?: string;
  dayId?: string;
  dayName?: string;
  day?: string;
  entries: Array<{
    exerciseId?: string;
    exerciseName?: string;
    sets?: RoutineLogSet[];
    weight?: string;
    reps?: string;
    rir?: string;
    comment?: string;
    notes?: string;
  }>;
};

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

const summarizeExercise = (exercise: RoutineExercise) => `${exercise.sets} series · ${exercise.repRange} reps · descanso ${exercise.rest}`;

export default function RoutineDayPage() {
  const params = useParams<{ routineId: string; dayId: string }>();
  const { user } = useAuth();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;
  const routinesPath = user?.uid ? `users/${user.uid}/routines` : null;

  const { data: routineTemplates } = useCol<RoutineTemplateDoc>(templatesPath, { by: "title", dir: "asc" });
  const { data: routineLogs } = useCol<StoredRoutineLog>(routinesPath, { by: "date", dir: "desc" });

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

  const day = useMemo(() => routine?.days.find((entry) => entry.id === params.dayId) ?? null, [routine, params.dayId]);

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
      <div className="rounded-2xl border border-[rgba(34,99,255,0.18)] bg-white/80 p-6 text-sm text-zinc-600">
        <p>No encontramos este dia en la rutina seleccionada.</p>
        <Link className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-zinc-600" href="/routines">
          Volver a rutinas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <Link href={`/routines/${routine.id}`} className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600">
          {"<- Volver a "}{routine.title}
        </Link>
      </div>

      <header className="glass-card border-[rgba(34,99,255,0.16)] bg-white/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Dia {day.order}</p>
            <h1 className="text-2xl font-semibold text-zinc-900">{day.title}</h1>
            {day.focus && <p className="mt-2 text-sm text-zinc-600">{day.focus}</p>}
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-zinc-500">
            {day.intensity && <span>Intensidad: {day.intensity}</span>}
            {day.estimatedDuration && <span>Duracion estimada: {day.estimatedDuration}</span>}
            <span>{day.exercises.length} ejercicios</span>
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
              routineId={routine.id}
              day={day}
              exercise={exercise}
              lastRecord={lastRecord}
            />
          );
        })}
      </section>

      <section className="rounded-2xl border border-[rgba(34,99,255,0.18)] bg-white/80 p-5 text-xs text-zinc-500">
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
    <div className="rounded-2xl border border-[rgba(34,99,255,0.16)] bg-white/80 p-4">
      <h3 className="text-sm font-semibold text-zinc-800">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-zinc-600">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-[rgba(34,99,255,0.45)]" aria-hidden />
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
    <article className="glass-card border-[rgba(34,99,255,0.16)] bg-white/80 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">{day.title}</p>
          <h3 className="text-base font-semibold text-zinc-900">{exercise.name}</h3>
          <p className="text-xs text-zinc-500">{summarizeExercise(exercise)}</p>
        </div>
        <Link
          href={detailHref}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(34,99,255,0.24)] bg-white/70 px-3 py-1 text-xs font-medium text-zinc-600"
        >
          Abrir ejercicio
        </Link>
      </header>

      <p className="mt-3 text-sm text-zinc-600">{exercise.tip}</p>

      {lastRecord && (
        <div className="mt-4 rounded-2xl border border-dashed border-[rgba(34,99,255,0.24)] bg-white/70 px-3 py-2 text-xs text-zinc-500">
          <p className="font-medium text-zinc-600">Ultimo registro</p>
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