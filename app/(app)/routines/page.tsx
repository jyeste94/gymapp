"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Trash2, Zap, Calendar, Dumbbell } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { Routine, RoutineTemplate } from "@/lib/types";
import { buildExerciseCatalog } from "@/lib/data/exercise-catalog";
import CreateRoutineDrawer from "@/app/(app)/routines/create-routine-drawer";
import { deleteRoutineTemplate } from "@/lib/firestore/routines";

const formatDaysLabel = (count: number) => `${count} dia${count === 1 ? "" : "s"}`;

export default function RoutinesPage() {
  const { user } = useAuth();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const { data: routineTemplates, loading } = useCol<RoutineTemplate>(templatesPath, {
    by: "title",
    dir: "asc",
  });

  const customRoutines = useMemo(() => (routineTemplates ?? []).map((template) => buildRoutine(template, defaultExercises)), [routineTemplates]);
  const allRoutines = useMemo(() => mergeRoutines(customRoutines, defaultRoutines), [customRoutines]);
  const exerciseCatalog = useMemo(() => buildExerciseCatalog(allRoutines), [allRoutines]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredRoutines = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return allRoutines;
    return allRoutines.filter((routine) => {
      const haystack = [routine.title, routine.description, routine.level, routine.frequency].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    });
  }, [allRoutines, query]);

  return (
    <div className="apple-page-shell space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="apple-kicker">Rutinas</p>
          <h1 className="sf-display-hero text-apple-near-black dark:text-white">Planes de entrenamiento</h1>
          <p className="sf-text-subnav mt-1 text-apple-near-black/60 dark:text-white/60">Crea, organiza y ejecuta tus rutinas por dias.</p>
        </div>
        <button type="button" onClick={() => setDrawerOpen(true)} disabled={!user} className="btn-apple-primary flex-shrink-0 disabled:opacity-60">
          <PlusCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Nueva rutina</span>
          <span className="sm:hidden">Crear</span>
        </button>
      </header>

      <section className="apple-panel p-6">
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-apple-near-black/40 dark:text-white/40" />
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar rutina por nombre, nivel o frecuencia..."
            className="w-full py-3.5 pl-12 pr-4"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`routine-skeleton-${index}`}
                className="h-44 animate-pulse rounded-2xl border border-apple-near-black/5 bg-apple-gray dark:border-white/5 dark:bg-apple-surface-2"
              />
            ))}
          </div>
        ) : allRoutines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-apple-near-black/20 bg-apple-gray py-12 text-center dark:border-white/20 dark:bg-apple-surface-2">
            <Zap className="mb-4 h-12 w-12 text-apple-near-black/30 dark:text-white/30" />
            <p className="sf-text-body-strong text-apple-near-black dark:text-white">Aun no tienes rutinas</p>
            <p className="mt-1 max-w-sm sf-text-caption text-apple-near-black/60 dark:text-white/60">
              Crea tu primer plan personalizado para empezar a registrar tu progreso.
            </p>
            <button onClick={() => setDrawerOpen(true)} className="apple-link mt-6">
              Crear ahora
            </button>
          </div>
        ) : filteredRoutines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-apple-near-black/20 p-8 text-center sf-text-body text-apple-near-black/60 dark:border-white/20 dark:text-white/60">
            No hay resultados con el filtro actual.
          </div>
        ) : (
          <div
            className={
              filteredRoutines.length === 1
                ? "grid max-w-md gap-5"
                : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {filteredRoutines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} userId={user?.uid} />
            ))}
          </div>
        )}
      </section>

      <CreateRoutineDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => setDrawerOpen(false)}
        exercises={exerciseCatalog}
        userId={user?.uid}
      />
    </div>
  );
}

type RoutineCardProps = {
  routine: Routine;
  userId?: string;
};

function RoutineCard({ routine, userId }: RoutineCardProps) {
  const dayCount = routine.days.length;
  const exerciseCount = routine.days.reduce((sum, day) => sum + day.exercises.length, 0);
  const isCustom = !defaultRoutines.some((r) => r.id === routine.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !isCustom) return;
    if (confirm("Seguro que quieres eliminar esta rutina?")) {
      await deleteRoutineTemplate(null, userId, routine.id);
    }
  };

  return (
    <Link href={`/routines/detail?id=${routine.id}`} className="group flex flex-col justify-between rounded-2xl bg-apple-gray p-5 transition-colors hover:bg-apple-blue/5 dark:bg-apple-surface-2">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-apple-blue shadow-sm transition-shadow group-hover:shadow-md dark:bg-apple-surface-1">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-apple-blue/10 px-2 py-1 sf-text-nano font-medium uppercase tracking-widest text-apple-blue">
              {routine.level ?? "Rutina"}
            </span>
            {isCustom && (
              <button
                onClick={handleDelete}
                className="rounded-full p-1.5 text-apple-near-black/50 transition-colors hover:bg-[#ff3b30]/10 hover:text-[#ff3b30] dark:text-white/50"
                title="Eliminar rutina"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5">
          <h2 className="sf-text-body-strong line-clamp-1 text-apple-near-black dark:text-white">{routine.title}</h2>
          {routine.description && <p className="mt-1 line-clamp-2 sf-text-caption text-apple-near-black/60 dark:text-white/60">{routine.description}</p>}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-apple-near-black/10 pt-4 dark:border-white/10">
        <div className="flex items-center gap-1.5 sf-text-caption font-medium text-apple-near-black/50 dark:text-white/50">
          <Calendar className="h-4 w-4" />
          <span>{formatDaysLabel(dayCount)}</span>
        </div>
        <div className="h-1 w-1 rounded-full bg-apple-near-black/20 dark:bg-white/20" />
        <div className="flex items-center gap-1.5 sf-text-caption font-medium text-apple-near-black/50 dark:text-white/50">
          <Dumbbell className="h-4 w-4" />
          <span>{exerciseCount} ej.</span>
        </div>
      </div>
    </Link>
  );
}
