
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Trash2 } from "lucide-react";
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

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const allRoutines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const exerciseCatalog = useMemo(() => buildExerciseCatalog(allRoutines), [allRoutines]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredRoutines = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return allRoutines;
    return allRoutines.filter((routine) => {
      const haystack = [routine.title, routine.description, routine.level, routine.frequency]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [allRoutines, query]);

  return (
    <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
      <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-brand-text-main">Rutinas</h1>
            <p className="text-sm text-brand-text-muted">
              Crea planes propios o reutiliza las rutinas guardadas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            disabled={!user}
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-brand-primary/90 disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" /> Crear rutina personalizada
          </button>
        </section>

        <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-dark px-3 py-2">
            <Search className="h-4 w-4 text-brand-text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar rutina por nombre, nivel o frecuencia"
              className="w-full bg-transparent text-sm text-brand-text-main outline-none placeholder:text-brand-text-muted/70"
            />
          </div>

          {loading ? (
            <p className="text-sm text-brand-text-muted">Cargando tus rutinas...</p>
          ) : allRoutines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface p-6 text-sm text-brand-text-muted">
              Todavia no tienes rutinas guardadas. Crea tu primera rutina personalizada para verla aqui.
            </div>
          ) : filteredRoutines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface p-6 text-sm text-brand-text-muted">
              No hay resultados para tu busqueda.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
  const isCustom = !defaultRoutines.some(r => r.id === routine.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !isCustom) return;
    if (confirm("Seguro que quieres eliminar esta rutina?")) {
      await deleteRoutineTemplate(null, userId, routine.id);
    }
  };

  return (
    <Link
      href={`/routines/detail?id=${routine.id}`}
      className="group relative flex flex-col gap-3 rounded-2xl border border-brand-border bg-brand-surface p-5 text-sm text-brand-text-muted transition hover:-translate-y-0.5 hover:shadow-lg hover:border-brand-primary/50"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {/* El foco ahora es a nivel de dia, usamos el nivel de la rutina como subtitulo */}
          <p className="text-xs uppercase tracking-[0.3em] text-brand-primary/80">{routine.level ?? "Rutina"}</p>
          <h2 className="mt-1 text-lg font-semibold text-brand-text-main">{routine.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {routine.level && <span className="rounded-md bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary uppercase tracking-wider">{routine.level}</span>}
          {isCustom && (
            <button
              onClick={handleDelete}
              
              className="rounded-full p-1 text-red-400 hover:bg-brand-dark disabled:opacity-50"
              title="Eliminar rutina"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {routine.description && <p className="text-xs text-brand-text-muted">{routine.description}</p>}
      <div className="flex flex-wrap gap-2 text-xs text-brand-text-muted">
        <span className="rounded-full border border-brand-border bg-brand-dark px-2 py-0.5">{formatDaysLabel(dayCount)}</span>
        <span className="rounded-full border border-brand-border bg-brand-dark px-2 py-0.5">{exerciseCount} ejercicios</span>
        {routine.frequency && (
          <span className="rounded-full border border-brand-border bg-brand-dark px-2 py-0.5">{routine.frequency}</span>
        )}
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
        Ver detalles <span>{">"}</span>
      </span>
    </Link>
  );
}

