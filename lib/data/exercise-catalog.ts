import type { RoutineDefinition } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import type { Exercise } from "@/lib/types";

export type ExerciseCatalogEntry = Exercise & {
  routineId?: string;
  routineTitle?: string;
  routineFocus?: string;
  dayId?: string;
  dayTitle?: string;
  tags: string[]; // Keep for compatibility if needed, or derived
  keywords: string;
};

const normalize = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function buildExerciseCatalog(routines: RoutineDefinition[]): ExerciseCatalogEntry[] {
  // Map to store the first usage context for each exercise
  const usageMap = new Map<string, { routine: RoutineDefinition; dayTitle: string; dayId: string }>();

  routines.forEach((routine) => {
    routine.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (!usageMap.has(exercise.id)) {
          usageMap.set(exercise.id, { routine, dayTitle: day.title, dayId: day.id });
        }
      });
    });
  });

  return defaultExercises.map((exercise) => {
    const usage = usageMap.get(exercise.id);
    const tags = [...exercise.muscleGroup, ...exercise.equipment];

    return {
      ...exercise,
      routineId: usage?.routine.id,
      routineTitle: usage?.routine.title ?? "General",
      routineFocus: usage?.routine.focus,
      dayId: usage?.dayId,
      dayTitle: usage?.dayTitle,
      tags,
      keywords: [
        exercise.name,
        usage?.routine.title,
        usage?.routine.focus,
        usage?.dayTitle,
        ...tags,
        exercise.description,
      ]
        .filter(Boolean)
        .map((value) => normalize(String(value)))
        .join(" \u2022 "),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}
