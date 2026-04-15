import type { Routine, Exercise } from "@/lib/types";
import { defaultExercises } from "@/lib/data/exercises";

export type ExerciseCatalogEntry = Exercise & {
  routineId?: string;
  routineTitle?: string;
  routineFocus?: string;
  dayId?: string;
  dayTitle?: string;
  tags: string[];
  keywords: string;
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function buildExerciseCatalog(routines: Routine[]): ExerciseCatalogEntry[] {
  const usageMap = new Map<string, { routine: Routine; dayTitle: string; dayId: string }>();
  const exerciseMap = new Map<string, Exercise>();

  defaultExercises.forEach((exercise) => {
    exerciseMap.set(exercise.id, exercise);
  });

  for (const routine of routines) {
    for (const day of routine.days) {
      for (const exercise of day.exercises) {
        if (!usageMap.has(exercise.id)) {
          usageMap.set(exercise.id, { routine, dayTitle: day.title, dayId: day.id });
        }

        if (!exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
            muscleGroup: exercise.muscleGroup,
            equipment: exercise.equipment,
            technique: exercise.technique,
            image: exercise.image,
            video: exercise.video,
          });
        }
      }
    }
  }

  return Array.from(exerciseMap.values())
    .map((exercise) => {
      const usage = usageMap.get(exercise.id);
      const tags = [...exercise.muscleGroup, ...exercise.equipment];

      const keywords = [
        exercise.name,
        usage?.routine.title,
        usage ? usage.routine.days.find((d) => d.id === usage.dayId)?.focus : undefined,
        usage?.dayTitle,
        ...tags,
        exercise.description,
      ]
        .filter(Boolean)
        .map((value) => normalize(String(value)))
        .join(" ");

      return {
        ...exercise,
        routineId: usage?.routine.id,
        routineTitle: usage?.routine.title ?? "General",
        routineFocus: usage ? usage.routine.days.find((d) => d.id === usage.dayId)?.focus : undefined,
        dayId: usage?.dayId,
        dayTitle: usage?.dayTitle,
        tags,
        keywords,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
