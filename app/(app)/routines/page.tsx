
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Trash2 } from "lucide-react";
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
import { useFirebase } from "@/lib/firebase/client-context";

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

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#0a2e5c]">Rutinas</h1>
          <p className="text-sm text-[#51607c]">
            Crea planes propios o reutiliza las rutinas guardadas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          disabled={!user}
          className="inline-flex items-center gap-2 rounded-full bg-[#0a2e5c] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
        >
          <PlusCircle className="h-4 w-4" /> Crear rutina personalizada
        </button>
      </section>

      <section className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        {loading ? (
          <p className="text-sm text-[#51607c]">Cargando tus rutinas...</p>
        ) : allRoutines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(10,46,92,0.2)] bg-white/70 p-6 text-sm text-[#51607c]">
            Todavia no tienes rutinas guardadas. Crea tu primera rutina personalizada para verla aqui.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {allRoutines.map((routine) => (
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
  const { db } = useFirebase();
  const dayCount = routine.days.length;
  const exerciseCount = routine.days.reduce((sum, day) => sum + day.exercises.length, 0);
  const isCustom = !defaultRoutines.some(r => r.id === routine.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || !isCustom || !db) return;
    if (confirm("Estas seguro de eliminar esta rutina?")) {
      await deleteRoutineTemplate(db, userId, routine.id);
    }
  };

  return (
    <Link
      href={`/routines/${routine.id}`}
      className="group relative flex flex-col gap-3 rounded-2xl border border-[rgba(10,46,92,0.16)] bg-white/90 p-5 text-sm text-[#4b5a72] transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          {/* El foco ahora es a nivel de dia, usamos el nivel de la rutina como subtitulo */}
          <p className="text-xs uppercase tracking-[0.3em] text-[#51607c]">{routine.level ?? "Rutina"}</p>
          <h2 className="mt-1 text-lg font-semibold text-[#0a2e5c]">{routine.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {routine.level && <span className="tag-pill">{routine.level}</span>}
          {isCustom && (
            <button
              onClick={handleDelete}
              disabled={!db}
              className="rounded-full p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
              title="Eliminar rutina"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {routine.description && <p className="text-xs text-[#51607c]">{routine.description}</p>}
      <div className="flex flex-wrap gap-2 text-xs text-[#51607c]">
        <span className="rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5">{formatDaysLabel(dayCount)}</span>
        <span className="rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5">{exerciseCount} ejercicios</span>
        {routine.frequency && (
          <span className="rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5">{routine.frequency}</span>
        )}
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a2e5c]">
        Ver detalles <span>{">"}</span>
      </span>
    </Link>
  );
}
