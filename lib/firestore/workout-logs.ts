"use client";
import { useState, useEffect } from "react";
import type { RoutineLog, RoutineLogEntry, RoutineLogSet } from "@/lib/types";
import { NutriFlowClient, type NutriFlowWorkoutSet } from "@/lib/api/nutriflow";
import { getCachedWorkoutSessions } from "@/lib/workout-cache";

export const useWorkoutLogs = (_userId?: string | null) => {
  void _userId;
  const [data, setData] = useState<RoutineLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLogs = async () => {
      setLoading(true);
      try {
        const sessions = await getCachedWorkoutSessions();

        if (cancelled) return;

        const logs: RoutineLog[] = sessions.map((session) => {
          const entries = groupSetsByExercise(session.sets ?? []);

          return {
            id: session.id,
            date: session.date,
            routineId: session.routine_id ?? undefined,
            routineName: session.routine_name ?? undefined,
            entries,
            effort: undefined,
            duration: session.duration_minutes != null ? `${session.duration_minutes} min` : undefined,
          };
        });

        setData(logs);
      } catch (error) {
        console.error("Error loading workout logs from API", error);
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLogs();

    return () => { cancelled = true; };
  }, []);

  return { data, loading };
};

function groupSetsByExercise(sets: NutriFlowWorkoutSet[]): RoutineLogEntry[] {
  const groups = new Map<string, { name: string; sets: RoutineLogSet[] }>();

  for (const set of sets) {
    if (!groups.has(set.exercise_id)) {
      groups.set(set.exercise_id, { name: set.exercise_name, sets: [] });
    }
    groups.get(set.exercise_id)!.sets.push({
      weight: String(set.weight),
      reps: set.reps,
    });
  }

  return Array.from(groups.entries()).map(([exerciseId, group]) => ({
    exerciseId,
    exerciseName: group.name,
    sets: group.sets,
  }));
}

export const addWorkoutLog = async (_db: unknown, userId: string, log: Omit<RoutineLog, "id">) => {
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
