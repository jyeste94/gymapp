import type { RoutineTemplate } from "@/lib/types";
import { NutriFlowClient, type NutriFlowCreateRoutineInput } from "@/lib/api/nutriflow";

export type RoutineTemplateInput = Omit<RoutineTemplate, "id">;

const DAY_TOKEN_PREFIX = "athlos-json:";

type EncodedDayDescriptor = {
  id: string;
  title: string;
  focus?: string;
  notes?: string;
  warmup?: string[];
  finisher?: string[];
  count: number;
};

export function userRoutineTemplatesPath(uid: string) {
  return `users/${uid}/routineTemplates`;
}

function encodeDayDescriptor(day: EncodedDayDescriptor): string {
  return `${DAY_TOKEN_PREFIX}${encodeURIComponent(JSON.stringify(day))}`;
}

function extractRepNumber(repRange: string): number {
  const match = repRange.match(/\d+/);
  return match ? Number(match[0]) : 10;
}

function buildRoutineRequest(routine: RoutineTemplateInput): NutriFlowCreateRoutineInput {
  const daysOfWeek = routine.days.map((day) =>
    encodeDayDescriptor({
      id: day.id,
      title: day.title,
      focus: day.focus,
      notes: day.notes,
      warmup: day.warmup ?? [],
      finisher: day.finisher ?? [],
      count: day.exercises.length,
    }),
  );

  const flattenedExercises = routine.days.flatMap((day) => day.exercises);
  const exercises = flattenedExercises.map((exercise) => ({
    exercise_id: exercise.id,
    sets: exercise.sets || 3,
    reps: extractRepNumber(exercise.repRange),
    restSeconds: extractRepNumber(exercise.rest) || 60,
  }));

  return {
    name: routine.title,
    daysOfWeek,
    exercises,
  };
}

export async function createRoutineTemplate(_db: unknown, _uid: string, routine: RoutineTemplateInput) {
  const payload = buildRoutineRequest(routine);
  const response = await NutriFlowClient.createRoutine(payload);
  return response.id;
}

export async function deleteRoutineTemplate(_db: unknown, _uid: string, routineId: string) {
  await NutriFlowClient.deleteRoutine(routineId);
}
