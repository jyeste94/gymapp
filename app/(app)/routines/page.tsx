"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import {
  defaultRoutines,
  mergeRoutines,
  templateToRoutineDefinition,
  type RoutineDefinition,
  type RoutineTemplateDoc,
} from "@/lib/data/routine-library";

type RoutineLog = {
  id: string;
  date: string;
  routineId?: string;
  routineName?: string;
  dayId?: string;
  dayName?: string;
  day?: string;
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

const summarizeRoutine = (routine: RoutineDefinition) => {
  const totalExercises = routine.days.reduce((sum, day) => sum + day.exercises.length, 0);
  return {
    dayCount: routine.days.length,
    exerciseCount: totalExercises,
  };
};

export default function RoutinesPage() {
  const { user } = useAuth();
  const logsPath = user?.uid ? `users/${user.uid}/routines` : null;
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const { data: routineLogs } = useCol<RoutineLog>(logsPath, { by: "date", dir: "desc" });
  const { data: routineTemplates } = useCol<RoutineTemplateDoc>(templatesPath, { by: "title", dir: "asc" });

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(templateToRoutineDefinition),
    [routineTemplates],
  );

  const routines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const lastCompleted = useMemo(() => {
    const map = new Map<string, string>();
    routineLogs?.forEach((log) => {
      const key = log.routineId || log.routineName || log.dayId || log.dayName || log.day;
      if (!key) return;
      const normalized = key.trim().toLowerCase();
      if (!normalized) return;
      const matchedRoutine = routines.find((routine) => {
        const aliases = [routine.id, routine.title, ...routine.days.map((day) => day.id), ...routine.days.map((day) => day.title)];
        return aliases.some((alias) => alias.trim().toLowerCase() === normalized);
      });
      if (!matchedRoutine) return;
      if (!map.has(matchedRoutine.id)) {
        map.set(matchedRoutine.id, log.date);
      }
    });
    return map;
  }, [routineLogs, routines]);

  return (
    <div className="space-y-6">
      <header className="glass-card border-[rgba(34,99,255,0.16)] bg-white/80 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Tus rutinas</p>
            <h1 className="text-2xl font-semibold text-zinc-900">Gestiona tus planes</h1>
            <p className="mt-2 text-sm text-zinc-600">
              Revisa tus rutinas guardadas, consulta los dias y accede rapido a los ejercicios con sus registros.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span>Intensidad</span>
            <span>|</span>
            <span>Duracion</span>
            <span>|</span>
            <span>Ultimo seguimiento</span>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {routines.map((routine) => {
          const lastDate = formatDate(lastCompleted.get(routine.id));
          const summary = summarizeRoutine(routine);
          return (
            <Link
              key={routine.id}
              href={`/routines/${routine.id}`}
              className="group relative overflow-hidden rounded-3xl border border-[rgba(34,99,255,0.18)] bg-white/75 p-5 text-sm text-zinc-600 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/40 opacity-0 transition group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">{routine.focus ?? "Rutina"}</p>
                    <h2 className="mt-1 text-lg font-semibold text-zinc-900">{routine.title}</h2>
                  </div>
                  {routine.level && <span className="tag-pill">{routine.level}</span>}
                </div>

                {routine.description && <p className="text-xs text-zinc-500">{routine.description}</p>}

                <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                  <span className="rounded-full border border-[rgba(34,99,255,0.2)] px-2 py-0.5">
                    {summary.dayCount} dias
                  </span>
                  <span className="rounded-full border border-[rgba(34,99,255,0.2)] px-2 py-0.5">
                    {summary.exerciseCount} ejercicios
                  </span>
                  {routine.frequency && (
                    <span className="rounded-full border border-[rgba(34,99,255,0.2)] px-2 py-0.5">{routine.frequency}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>{lastDate ? `Ultimo registro ${lastDate}` : "Sin registro aun"}</span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700">
                    Abrir rutina <span className="text-xs">&gt;</span>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
