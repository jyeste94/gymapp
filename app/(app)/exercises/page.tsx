"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Dumbbell, Search } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { defaultExercises } from "@/lib/data/exercises";
import { defaultRoutines } from "@/lib/data/routine-library";
import { buildExerciseCatalog } from "@/lib/data/exercise-catalog";
import { useCol } from "@/lib/firestore/hooks";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { RoutineTemplate } from "@/lib/types";

export default function ExercisesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;
  const { data: routineTemplates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map((template) => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const allRoutines = useMemo(() => mergeRoutines(customRoutines, defaultRoutines), [customRoutines]);
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
    <div className="apple-page-shell space-y-8">
      <header className="mb-8 flex flex-col gap-2">
        <p className="apple-kicker">Ejercicios</p>
        <h1 className="sf-display-hero text-apple-near-black dark:text-white">Catalogo de ejercicios</h1>
        <p className="max-w-xl sf-text-subnav text-apple-near-black/60 dark:text-white/60">
          Domina la tecnica. Explora movimientos por grupo muscular y rutina.
        </p>
      </header>

      <section className="apple-panel p-6 lg:p-8">
        <div className="relative mb-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-apple-near-black/40 dark:text-white/40" />
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por ejercicio, musculo o rutina..."
            className="w-full rounded-2xl border border-apple-near-black/5 bg-apple-gray py-4 pl-12 pr-4 sf-text-body text-apple-near-black placeholder:text-apple-near-black/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] outline-none focus:ring-2 focus:ring-apple-blue dark:border-white/5 dark:bg-apple-surface-2 dark:text-white dark:placeholder:text-white/40"
          />
        </div>

        {filteredExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-apple-near-black/5 bg-apple-gray py-16 text-center dark:border-white/5 dark:bg-apple-surface-2">
            <Dumbbell className="mb-4 h-12 w-12 text-apple-near-black/30 dark:text-white/30" />
            <p className="sf-text-body-strong text-apple-near-black dark:text-white">Sin resultados</p>
            <p className="mt-1 sf-text-caption text-apple-near-black/50 dark:text-white/50">No se encontraron ejercicios para tu busqueda.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/exercises/detail?id=${exercise.id}`}
                className="group flex flex-col justify-between rounded-3xl border border-apple-near-black/5 bg-apple-gray p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:bg-apple-blue/5 dark:border-white/5 dark:bg-apple-surface-2"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-apple-near-black/5 bg-white px-2.5 py-1 sf-text-nano uppercase tracking-widest text-apple-near-black/60 shadow-sm dark:border-white/5 dark:bg-apple-surface-1 dark:text-white/60">
                        {exercise.routineTitle}
                      </span>
                      {exercise.routineFocus && (
                        <span className="rounded-md bg-apple-blue/10 px-2.5 py-1 sf-text-nano uppercase tracking-widest text-apple-blue">
                          {exercise.routineFocus}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <h2 className="sf-display-card-title leading-tight text-apple-near-black transition-colors group-hover:text-apple-blue dark:text-white">
                      {exercise.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 h-10 sf-text-body leading-relaxed text-apple-near-black/60 dark:text-white/60">
                      {exercise.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-apple-near-black/5 pt-4 dark:border-white/5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {exercise.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-apple-near-black/5 bg-white px-2.5 py-1 sf-text-nano text-apple-near-black/50 shadow-sm dark:border-white/5 dark:bg-apple-surface-1 dark:text-white/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="sf-text-link text-apple-blue">Tecnica y detalles</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-apple-near-black/5 bg-white text-apple-blue shadow-sm transition-transform group-hover:scale-105 group-hover:bg-apple-blue group-hover:text-white dark:border-white/5 dark:bg-apple-surface-1">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
