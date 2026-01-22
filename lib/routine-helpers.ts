import type { Equipment, RoutineLevel } from "@/lib/types";
import type { RoutineTemplateInput } from "@/lib/firestore/routines";
import type { RoutineExercise } from "@/lib/types";

export type BuilderDay = {
  id: string;
  title: string;
  focus: string;
  notes: string;
  exercises: RoutineExercise[];
};

export type RoutineFormState = {
  title: string;
  description: string;
  focus: string;
  level: string;
  frequency: string;
  equipment: string;
  days: BuilderDay[];
};

export function validateRoutineForm(form: RoutineFormState, userId?: string | null): string | null {
  if (!userId) return "Inicia sesion para crear tus rutinas.";
  if (form.title.trim().length <= 2) return "El nombre es demasiado corto.";

  const allDaysHaveExercises = form.days.every((day) => day.exercises.length > 0);
  if (!allDaysHaveExercises) return "Cada dia debe tener al menos un ejercicio.";

  return null; // Valid
}

export function buildRoutinePayload(form: RoutineFormState): RoutineTemplateInput {
  const equipmentList = form.equipment
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean) as Equipment[];

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    goal: form.focus.trim() || undefined,
    level: form.level.trim() as RoutineLevel,
    frequency: form.frequency.trim(),
    equipment: equipmentList,
    days: form.days.map((day, index) => ({
      id: day.id,
      title: day.title.trim() || `Dia ${index + 1}`,
      focus: day.focus.trim() || undefined,
      notes: day.notes.trim() || undefined,
      warmup: [],
      finisher: [],
      exercises: day.exercises,
    })),
  };
}
