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
  type RoutineTemplateDoc,
} from "@/lib/data/routine-library";

const formatBadge = (label: string) => (
  <span className="rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5 text-xs text-[#51607c]">
    {label}
  </span>
);

export default function RoutineOverviewPage() {
  const params = useParams<{ routineId: string }>();
  const { user } = useAuth();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;
  const { data: routineTemplates } = useCol<RoutineTemplateDoc>(templatesPath, { by: "title", dir: "asc" });

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

  if (!routine) {
    return (
      <div className="rounded-2xl border border-[rgba(10,46,92,0.18)] bg-white/80 p-6 text-sm text-[#4b5a72]">
        <p>No encontramos esa rutina. Vuelve al listado y selecciona una disponible.</p>
        <Link className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#4b5a72]" href="/routines">
          Volver a rutinas
        </Link>
      </div>
    );
  }

  const sortedDays = [...routine.days].sort((a, b) => a.order - b.order);
  const totalExercises = sortedDays.reduce((sum, day) => sum + day.exercises.length, 0);

  return (
    <div className="space-y-6">
      <header className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Rutina</p>
            <h1 className="text-2xl font-semibold text-zinc-900">{routine.title}</h1>
            {routine.description && <p className="text-sm text-[#4b5a72]">{routine.description}</p>}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {routine.level && formatBadge(routine.level)}
            {routine.frequency && formatBadge(routine.frequency)}
            {formatBadge(`${sortedDays.length} dias`)}
            {formatBadge(`${totalExercises} ejercicios`)}
          </div>
        </div>
        {routine.equipment.length > 0 && (
          <p className="mt-4 text-xs text-[#51607c]">
            Equipo sugerido: {routine.equipment.join(", ")}
          </p>
        )}
      </header>

      <section className="space-y-3">
        {sortedDays.map((day) => (
          <Link
            key={day.id}
            href={`/routines/${routine.id}/${day.id}`}
            className="flex items-center justify-between rounded-2xl border border-[rgba(10,46,92,0.18)] bg-white/80 px-5 py-4 text-sm text-[#4b5a72] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(10,46,92,0.3)] bg-white text-base font-semibold text-[#0a2e5c]">
                {day.order}
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{day.title}</p>
                <p className="text-xs text-[#51607c]">
                  {day.exercises.length} ejercicios
                  {day.focus ? ` ? ${day.focus}` : ""}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#51607c]">Ver dia &gt;</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

