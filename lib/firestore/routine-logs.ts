
import { useCol } from "@/lib/firestore/hooks";
import { add } from "@/lib/firestore/crud";
import { Firestore } from "firebase/firestore";

export type RoutineLogSet = {
  weight?: string;
  reps?: string;
  rir?: string;
  comment?: string;
  notes?: string;
  completed?: boolean;
};

export type RoutineLog = {
  id: string;
  date: string;
  routineId?: string;
  routineName?: string;
  dayId?: string;
  dayName?: string;
  day?: string;
  entries: Array<{
    exerciseId?: string;
    exerciseName?: string;
    sets?: RoutineLogSet[];
    weight?: string;
    reps?: string;
    rir?: string;
    comment?: string;
    notes?: string;
  }>;
};

export const useRoutineLogs = (userId?: string | null) =>
  useCol<RoutineLog>(userId ? `users/${userId}/routines` : null, { by: "date", dir: "desc" });

export const addRoutineLog = async (db: Firestore, userId: string, log: Omit<RoutineLog, "id">) => {
  return add(db, `users/${userId}/routines`, {
    ...log,
    id: crypto.randomUUID(),
  });
};
