import { useMemo } from "react";
import { NutriFlowClient } from "@/lib/api/nutriflow";

export type ExerciseLogSet = {
  weight?: string;
  reps?: string;
  rir?: string;
  completed?: boolean;
};

export type ExerciseLog = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  routineId?: string;
  routineName?: string;
  dayId?: string;
  dayName?: string;
  date: string;
  perceivedEffort?: string | null;
  notes?: string | null;
  mediaImage?: string | null;
  mediaVideo?: string | null;
  sets: ExerciseLogSet[];
};

export type ExerciseLogInput = Omit<ExerciseLog, "id">;

export const useExerciseLogs = (_userId?: string | null) => {
  void _userId;
  const data = useMemo<ExerciseLog[]>(() => [], []);
  return { data, loading: false };
};

export async function saveExerciseLog(_db: unknown, _userId: string, data: ExerciseLogInput) {
  const session = await NutriFlowClient.startWorkoutSession(data.routineId);

  for (const set of data.sets) {
    const hasData = Number(set.reps) > 0 || Number(set.weight) > 0;
    if (!hasData) continue;

    await NutriFlowClient.logWorkoutSet(session.id, {
      exercise_id: data.exerciseId,
      reps: Number(set.reps) || 0,
      weight: Number(set.weight) || 0,
    });
  }

  return session.id;
}

export async function updateExerciseLog(_db: unknown, userId: string, _logId: string, data: Partial<ExerciseLogInput>) {
  if (!data.exerciseId || !data.sets) {
    throw new Error("exerciseId y sets son requeridos para actualizar en NutriFlow");
  }

  return saveExerciseLog(null, userId, {
    exerciseId: data.exerciseId,
    exerciseName: data.exerciseName ?? "Ejercicio",
    routineId: data.routineId,
    routineName: data.routineName,
    dayId: data.dayId,
    dayName: data.dayName,
    date: data.date ?? new Date().toISOString(),
    perceivedEffort: data.perceivedEffort,
    notes: data.notes,
    mediaImage: data.mediaImage,
    mediaVideo: data.mediaVideo,
    sets: data.sets,
  });
}
