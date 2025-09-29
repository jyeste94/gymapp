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
import { buildExerciseCatalog } from "@/lib/data/exercise-catalog";

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

  const exercises = useMemo(() => buildExerciseCatalog(routines), [routines]);

  return (
    <div className="space-y-6">
      <header className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Biblioteca de ejercicios</h1>
        <p className="mt-2 text-sm text-[#4b5a72]">
          Selecciona un ejercicio para ver recomendaciones, tecnica y registrar tus sesiones.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exercises.map((exercise) => (
          <Link
            key={exercise.id}
            href={`/exercises/${exercise.id}`}
            className="group relative overflow-hidden rounded-3xl border border-[rgba(10,46,92,0.18)] bg-white/75 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >            <div className="relative flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">{exercise.routineTitle}</p>
                <h2 className="mt-1 text-lg font-semibold text-zinc-900">{exercise.name}</h2>
              </div>
              {exercise.routineFocus && <span className="tag-pill">{exercise.routineFocus}</span>}
            </div>
            <p className="relative mt-3 text-sm leading-relaxed text-[#4b5a72]">{exercise.description}</p>
            <div className="relative mt-4 flex flex-wrap gap-2 text-xs text-[#51607c]">
              {exercise.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
            <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0a2e5c]">
              Ver detalle <span className="text-xs">&gt;</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}



