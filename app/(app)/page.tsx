"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import type { Measurement, Routine, RoutineTemplate } from "@/lib/types";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import ProfileHeader from "@/components/dashboard/profile-header";
import StatRow from "@/components/dashboard/stat-row";

type RoutineAccent = "blue" | "amber" | "rose" | "navy";
const ROUTINE_ACCENTS: RoutineAccent[] = ["blue", "amber", "rose", "navy"];

export default function Dashboard() {
  const { user } = useAuth();
  const measurementPath = user?.uid ? `users/${user.uid}/measurements` : null;
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const { data: measurements, loading: measurementsLoading } = useCol<Measurement>(measurementPath, {
    by: "date",
    dir: "desc",
  });

  const { data: routineTemplates, loading: templatesLoading } = useCol<RoutineTemplate>(templatesPath, {
    by: "title",
    dir: "desc",
  });

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const routines = useMemo(() => mergeRoutines(customRoutines, defaultRoutines), [customRoutines]);
  const featuredRoutines = routines.slice(0, 4);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header Profile Section */}
      <section>
        <ProfileHeader />
      </section>

      {/* 2. Key Metrics Row */}
      <section>
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-[#0a2e5c]">Metricas Rapidas</h2>
          <Link href="/measurements" className="text-xs font-bold text-blue-600 hover:text-blue-800">
            Ver Historial
          </Link>
        </div>
        <StatRow measurements={measurements} loading={measurementsLoading} />
      </section>

      {/* 3. Routines Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-[#0a2e5c]">Tu Entrenamiento</h2>
          <Link href="/routines" className="text-xs font-bold text-blue-600 hover:text-blue-800">
            Explorar Todo
          </Link>
        </div>

        {templatesLoading && routines.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center text-sm text-blue-400">
            Cargando tus rutinas...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredRoutines.map((routine, index) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                accent={ROUTINE_ACCENTS[index % ROUTINE_ACCENTS.length]}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Quick Actions / Promo */}
      <section className="glass-card overflow-hidden rounded-3xl border border-[rgba(10,46,92,0.1)] bg-gradient-to-r from-white to-blue-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#0a2e5c]">¿Toca Entrenar?</h3>
            <p className="text-sm text-zinc-500">Selecciona una rutina arriba o inicia una rápida.</p>
          </div>
          <Link href="/routines" className="rounded-xl bg-[#0a2e5c] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition-transform active:scale-95">
            Ver Planes
          </Link>
        </div>
      </section>
    </div>
  );
}

type RoutineCardProps = {
  routine: Routine;
  accent?: RoutineAccent;
};

function RoutineCard({ routine }: RoutineCardProps) {
  const dayCount = routine.days.length;
  const exerciseCount = routine.days.reduce((sum, day) => sum + day.exercises.length, 0);

  return (
    <Link
      href={`/routines/${routine.id}`}
      className="group relative flex flex-col justify-between gap-4 rounded-3xl border border-[rgba(10,46,92,0.08)] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
    >
      <div>
        <div className="mb-3 flex items-start justify-between">
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            {routine.level}
          </span>
          {/* Icon or simplified graphic could go here */}
        </div>
        <h3 className="text-lg font-bold leading-tight text-[#0a2e5c] group-hover:text-blue-700">
          {routine.title}
        </h3>
        {routine.description && (
          <p className="mt-2 text-xs leading-relaxed text-zinc-500 line-clamp-2">
            {routine.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
        <div className="flex gap-3 text-xs font-medium text-zinc-400">
          <span className="flex items-center gap-1">
            📅 {dayCount}d
          </span>
          <span className="flex items-center gap-1">
            ⚡ {exerciseCount} ej
          </span>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
          →
        </div>
      </div>
    </Link>
  );
}

