"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import { buildExerciseCatalog } from "@/lib/data/exercise-catalog";
import type { RoutineTemplate } from "@/lib/types";

export default function ExercisesPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;
  const { data: routineTemplates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });

  // Construye las rutinas personalizadas a partir de las plantillas de Firestore.
  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  // Combina las rutinas personalizadas con las de por defecto.
  const allRoutines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  // Construye el catalogo de ejercicios enriquecido para la UI.
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
    <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-auto md:mt-0 md:min-h-screen md:w-full md:max-w-lg md:rounded-3xl md:shadow-2xl">
      <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto">
        <header className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-brand-text-main">Biblioteca de ejercicios</h1>
          <p className="mt-2 text-sm text-brand-text-muted">
            Selecciona un ejercicio para ver recomendaciones, tecnica y registrar tus sesiones.
          </p>
        </header>

        <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-surface px-3 py-2">
          <Search className="h-4 w-4 text-brand-text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por ejercicio, musculo o rutina"
            className="w-full bg-transparent text-sm text-brand-text-main outline-none placeholder:text-brand-text-muted/70"
          />
        </div>

        {filteredExercises.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-border bg-brand-surface p-6 text-sm text-brand-text-muted">
            No hay ejercicios para tu busqueda.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/exercises/${exercise.id}`}
              className="group relative overflow-hidden rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:border-brand-primary/50"
            >
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-brand-primary/80">{exercise.routineTitle}</p>
                  <h2 className="mt-1 text-lg font-semibold text-brand-text-main">{exercise.name}</h2>
                </div>
                {exercise.routineFocus && <span className="rounded-md bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary uppercase tracking-wider">{exercise.routineFocus}</span>}
              </div>
              <p className="relative mt-3 text-sm leading-relaxed text-brand-text-muted">{exercise.description}</p>
              <div className="relative mt-4 flex flex-wrap gap-2 text-xs text-brand-text-muted">
                {exercise.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-brand-border bg-brand-dark px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
              <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-primary">
                Ver detalle <span className="text-xs">&gt;</span>
              </span>
            </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
