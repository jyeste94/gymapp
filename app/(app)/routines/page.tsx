
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Trash2, Zap, Calendar, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen pb-32 pt-6 lg:pb-12"
    >
      <div className="relative z-10 space-y-8 px-5 lg:px-0">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-bebas text-4xl uppercase text-brand-text-main md:text-5xl">
              Planes de <span className="text-brand-primary text-glow-primary">Entrenamiento</span>
            </h1>
            <p className="text-sm text-brand-text-muted mt-1">
              Forja tu disciplina. Elige o crea el camino hacia tu mejor versión.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            disabled={!user}
            className="btn-primary flex-shrink-0"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Nueva Rutina</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </header>

        <motion.section variants={itemVariants} className="glass-card p-6 rounded-4xl">
          <div className="mb-6 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-brand-text-muted" />
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar rutina por nombre, nivel o frecuencia..."
              className="w-full rounded-2xl border border-brand-border bg-brand-dark/50 py-4 pl-12 pr-4 text-brand-text-main outline-none transition-all focus:border-brand-primary/50 focus:bg-brand-dark/80 focus:ring-4 focus:ring-brand-primary/10"
            />
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-dark border-t-brand-primary" />
            </div>
          ) : allRoutines.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-border bg-brand-dark/30 py-12 text-center">
              <Zap className="mb-4 h-12 w-12 text-brand-text-muted opacity-50" />
              <p className="text-brand-text-main font-bold">Aún no tienes rutinas</p>
              <p className="mt-1 text-sm text-brand-text-muted max-w-sm">Crea tu primer plan de entrenamiento personalizado para empezar a registrar tu progreso.</p>
              <button onClick={() => setDrawerOpen(true)} className="mt-6 btn-ghost py-2">
                Crear ahora
              </button>
            </div>
          ) : filteredRoutines.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-border bg-brand-dark/30 p-8 text-center text-brand-text-muted">
              No hay resultados para &quot;{query}&quot;.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRoutines.map((routine) => (
                <RoutineCard key={routine.id} routine={routine} userId={user?.uid} />
              ))}
            </div>
          )}
        </motion.section>

        <CreateRoutineDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onCreated={() => setDrawerOpen(false)}
          exercises={exerciseCatalog}
          userId={user?.uid}
        />
      </div>
    </motion.div>
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
    if (confirm("¿Seguro que quieres eliminar esta rutina?")) {
      await deleteRoutineTemplate(null, userId, routine.id);
    }
  };

  return (
    <Link
      href={`/routines/detail?id=${routine.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-border bg-brand-surface-light/30 p-6 transition-all hover:-translate-y-1 hover:bg-brand-surface-light/60 hover:border-brand-primary/30 hover:shadow-[0_8px_30px_-12px_rgba(62,224,127,0.2)]"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-primary/5 blur-3xl transition-all group-hover:bg-brand-primary/10" />
      
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark border border-brand-border text-brand-primary group-hover:border-brand-primary/30 group-hover:shadow-[0_0_15px_rgba(62,224,127,0.2)] transition-all">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
              {routine.level ?? "Rutina"}
            </span>
            {isCustom && (
              <button
                onClick={handleDelete}
                className="rounded-full p-1.5 text-brand-text-muted hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Eliminar rutina"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5">
          <h2 className="text-xl font-bold text-brand-text-main line-clamp-1">{routine.title}</h2>
          {routine.description && (
            <p className="mt-2 text-sm text-brand-text-muted line-clamp-2">{routine.description}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-brand-border/50 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-brand-text-muted font-medium">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDaysLabel(dayCount)}</span>
        </div>
        <div className="h-1 w-1 rounded-full bg-brand-border" />
        <div className="flex items-center gap-1.5 text-xs text-brand-text-muted font-medium">
          <Dumbbell className="h-3.5 w-3.5" />
          <span>{exerciseCount} ej.</span>
        </div>
      </div>
    </Link>
  );
}


