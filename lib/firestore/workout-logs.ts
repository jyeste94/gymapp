import { useMemo } from "react";
import type { RoutineLog } from "@/lib/types";
import { NutriFlowClient } from "@/lib/api/nutriflow";

export const useWorkoutLogs = (_userId?: string | null) => {
  void _userId;
  const data = useMemo<RoutineLog[]>(() => [], []);
  return { data, loading: false };
};

export const addWorkoutLog = async (_db: unknown, _userId: string, log: Omit<RoutineLog, "id">) => {
  const session = await NutriFlowClient.startWorkoutSession(log.routineId);

  for (const entry of log.entries ?? []) {
    const validSets = entry.sets.filter((set) => Number(set.reps) > 0 || Number(set.weight) > 0);

    for (const set of validSets) {
      await NutriFlowClient.logWorkoutSet(session.id, {
        exercise_id: entry.exerciseId,
        reps: Number(set.reps) || 0,
        weight: Number(set.weight) || 0,
      });
    }
  }

  return session.id;
};
