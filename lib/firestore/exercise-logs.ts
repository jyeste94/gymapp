
import { add } from "@/lib/firestore/crud";
import { useCol } from "@/lib/firestore/hooks";
import { Firestore } from "firebase/firestore";

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

export const useExerciseLogs = (userId?: string | null) =>
  useCol<ExerciseLog>(userId ? `users/${userId}/exerciseLogs` : null, { by: "date", dir: "desc" });

export async function saveExerciseLog(db: Firestore, userId: string, data: ExerciseLogInput) {
  return add(db, `users/${userId}/exerciseLogs`, {
    id: crypto.randomUUID(),
    ...data,
  });
}
