"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import {
  defaultRoutines,
  mergeRoutines,
  templateToRoutineDefinition,
  type RoutineTemplateDoc,
} from "@/lib/data/routine-library";

export default function ExercisesPage() {
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

  const exercises = useMemo(() => {
    const map = new Map<string, {
      id: string;
      name: string;
      focus?: string;
      routineTitle: string;
      tags: string[];
      description: string;
    }>();
    routines.forEach((routine) => {
      routine.days.forEach((day) => {
        day.exercises.forEach((exercise) => {
          if (map.has(exercise.id)) return;
          map.set(exercise.id, {
            id: exercise.id,
            name: exercise.name,
            focus: day.focus ?? routine.focus,
            routineTitle: routine.title,
            tags: exercise.tags,
            description: exercise.description,
          });
        });
      });
    });
    return Array.from(map.values());
  }, [routines]);

  return (
    <div className="space-y-6">
      <header className="glass-card border-[rgba(34,99,255,0.16)] bg-white/80 p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Biblioteca de ejercicios</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Selecciona un ejercicio para ver recomendaciones, tecnica y registrar tus sesiones.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exercises.map((exercise) => (
          <Link
            key={exercise.id}
            href={`/exercises/${exercise.id}`}
            className="group relative overflow-hidden rounded-3xl border border-[rgba(34,99,255,0.18)] bg-white/75 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/40 opacity-0 transition group-hover:opacity-100" aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">{exercise.routineTitle}</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-900">{exercise.name}</h2>
              </div>
              {exercise.focus && <span className="tag-pill">{exercise.focus}</span>}
            </div>
            <p className="relative mt-3 text-sm leading-relaxed text-zinc-600">{exercise.description}</p>
            <div className="relative mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
              {exercise.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[rgba(34,99,255,0.2)] px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
            <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-700">
              Ver detalle <span className="text-xs">&gt;</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}