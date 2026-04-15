"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Dumbbell, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import { buildExerciseCatalog } from "@/lib/data/exercise-catalog";
import type { RoutineTemplate } from "@/lib/types";

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

export default function ExercisesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;
  const { data: routineTemplates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const allRoutines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const exercises = useMemo(() => buildExerciseCatalog(allRoutines), [allRoutines]);
  const filteredExercises = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return exercises;
    return exercises.filter((exercise) => {
      const haystack = [exercise.name, exercise.description, ...exercise.tags, exercise.routineTitle]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [exercises, query]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen pb-32 pt-6 lg:pb-12"
    >
      <div className="relative z-10 space-y-8 px-5 lg:px-0">
        
        <header className="flex flex-col gap-2">
          <h1 className="font-bebas text-4xl uppercase text-brand-text-main md:text-5xl">
            Catálogo de <span className="text-brand-primary text-glow-primary">Ejercicios</span>
          </h1>
          <p className="text-sm text-brand-text-muted max-w-xl">
            Domina la técnica. Explora el arsenal completo de movimientos para construir tu cuerpo ideal.
          </p>
        </header>

        <motion.section variants={itemVariants} className="glass-card p-6 rounded-4xl">
          <div className="mb-8 relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-brand-text-muted" />
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por ejercicio, músculo o rutina..."
              className="w-full rounded-2xl border border-brand-border bg-brand-dark/50 py-4 pl-12 pr-4 text-brand-text-main outline-none transition-all focus:border-brand-primary/50 focus:bg-brand-dark/80 focus:ring-4 focus:ring-brand-primary/10"
            />
          </div>

          {filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-border bg-brand-dark/30 py-12 text-center">
              <Dumbbell className="mb-4 h-12 w-12 text-brand-text-muted opacity-50" />
              <p className="text-brand-text-main font-bold">Sin resultados</p>
              <p className="mt-1 text-sm text-brand-text-muted">No se encontraron ejercicios para &quot;{query}&quot;.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredExercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/exercises/${exercise.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-border bg-brand-surface-light/30 p-6 transition-all hover:-translate-y-1 hover:bg-brand-surface-light/60 hover:border-brand-primary/30 hover:shadow-[0_8px_30px_-12px_rgba(62,224,127,0.2)]"
                >
                  <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-brand-primary/5 blur-3xl transition-all group-hover:bg-brand-primary/10" />
                  
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-brand-dark border border-brand-border px-2.5 py-1 text-[10px] font-bold text-brand-text-muted uppercase tracking-wider group-hover:border-brand-primary/30 group-hover:text-brand-primary transition-colors">
                          {exercise.routineTitle}
                        </span>
                        {exercise.routineFocus && (
                          <span className="rounded-lg bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                            {exercise.routineFocus}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h2 className="text-xl font-bold text-brand-text-main leading-tight">{exercise.name}</h2>
                      <p className="mt-2 text-sm text-brand-text-muted line-clamp-2 leading-relaxed">
                        {exercise.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-brand-border/50 pt-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exercise.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-brand-dark px-2.5 py-1 text-xs text-brand-text-muted border border-brand-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary">
                        Técnica y Detalles
                      </span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-brand-primary transition-all group-hover:bg-brand-primary group-hover:text-brand-dark shadow-[0_0_10px_rgba(62,224,127,0)] group-hover:shadow-[0_0_10px_rgba(62,224,127,0.4)]">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}
