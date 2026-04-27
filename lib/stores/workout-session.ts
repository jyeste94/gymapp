import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoutineExercise } from "@/lib/types";
import { NutriFlowClient } from "@/lib/api/nutriflow";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export type WorkoutSet = {
    id: string;
    weight: string;
    reps: string;
    rir: string;
    completed: boolean;
    loggedToApi?: boolean;
};

export type ActiveExercise = Omit<RoutineExercise, "sets"> & {
    sets: WorkoutSet[];
    originalSets: number;
    notes?: string;
};

type WorkoutState = {
    startTime: number | null;
    sessionId: string | null;
    routineId: string | null;
    routineTitle: string | null;
    dayId: string | null;
    dayTitle: string | null;
    exercises: ActiveExercise[];
    activeExerciseId: string | null;

    startWorkout: (params: {
        routineId: string;
        routineTitle: string;
        dayId: string;
        dayTitle: string;
        exercises: RoutineExercise[];
        history?: Record<string, { weight: string; reps: string }[]>;
    }) => void;
    updateSet: (exerciseId: string, setId: string, updates: Partial<WorkoutSet>) => void;
    toggleSetComplete: (exerciseId: string, setId: string) => void;
    addSet: (exerciseId: string) => void;
    removeSet: (exerciseId: string, setId: string) => void;
    finishWorkout: () => void;
    cancelWorkout: () => void;
};

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            startTime: null,
            sessionId: null,
            routineId: null,
            routineTitle: null,
            dayId: null,
            dayTitle: null,
            exercises: [],
            activeExerciseId: null,

            startWorkout: async ({ routineId, routineTitle, dayId, dayTitle, exercises, history }) => {
                let sessionId: string | null = null;
                try {
                    const session = await NutriFlowClient.startWorkoutSession(routineId);
                    sessionId = session.id;
                } catch (e) {
                    console.error("Failed to create workout session", e);
                }

                set({
                    startTime: Date.now(),
                    sessionId,
                    routineId,
                    routineTitle,
                    dayId,
                    dayTitle,
                    exercises: exercises.map((ex) => {
                        const previousSets = history?.[ex.id] ?? [];
                        const lastValidWeight = previousSets.length > 0
                            ? previousSets[previousSets.length - 1].weight
                            : "";

                        return {
                            ...ex,
                            originalSets: ex.sets,
                            sets: Array.from({ length: ex.sets || 3 }).map((_, idx) => ({
                                id: generateId(),
                                weight: previousSets[idx]?.weight ?? lastValidWeight,
                                reps: "",
                                rir: "",
                                completed: false,
                                loggedToApi: false,
                            })),
                        };
                    }),
                    activeExerciseId: exercises[0]?.id ?? null,
                });
            },

            updateSet: (exerciseId, setId, updates) => {
                set((state) => ({
                    exercises: state.exercises.map((ex) =>
                        ex.id === exerciseId
                            ? {
                                ...ex,
                                sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...updates } : s)),
                            }
                            : ex
                    ),
                }));
            },

            toggleSetComplete: async (exerciseId, setId) => {
                const state = get();
                const ex = state.exercises.find((e) => e.id === exerciseId);
                const setItem = ex?.sets.find((s) => s.id === setId);
                if (!ex || !setItem) return;

                const becomingComplete = !setItem.completed;
                const updatedSets = ex.sets.map((s) =>
                    s.id === setId ? { ...s, completed: becomingComplete } : s
                );

                set({
                    exercises: state.exercises.map((e) =>
                        e.id === exerciseId ? { ...e, sets: updatedSets } : e
                    ),
                });

                if (becomingComplete && state.sessionId) {
                    const reps = Number(setItem.reps) || 0;
                    const weight = Number(setItem.weight) || 0;
                    if (reps > 0 || weight > 0) {
                        try {
                            await NutriFlowClient.logWorkoutSet(state.sessionId, {
                                exercise_id: exerciseId,
                                reps,
                                weight,
                            });
                            set({
                                exercises: state.exercises.map((e) =>
                                    e.id === exerciseId
                                        ? {
                                            ...e,
                                            sets: e.sets.map((s) =>
                                                s.id === setId ? { ...s, loggedToApi: true } : s
                                            ),
                                        }
                                        : e
                                ),
                            });
                        } catch (e) {
                            console.error("Failed to log set to API", e);
                        }
                    }
                }
            },

            addSet: (exerciseId) => {
                set((state) => ({
                    exercises: state.exercises.map((ex) =>
                        ex.id === exerciseId
                            ? {
                                ...ex,
                                sets: [
                                    ...ex.sets,
                                    {
                                        id: generateId(),
                                        weight: ex.sets[ex.sets.length - 1]?.weight ?? "",
                                        reps: "",
                                        rir: "",
                                        completed: false,
                                        loggedToApi: false,
                                    },
                                ],
                            }
                            : ex
                    ),
                }));
            },

            removeSet: (exerciseId, setId) => {
                set((state) => ({
                    exercises: state.exercises.map((ex) =>
                        ex.id === exerciseId
                            ? {
                                ...ex,
                                sets: ex.sets.filter((s) => s.id !== setId),
                            }
                            : ex
                    ),
                }));
            },

            finishWorkout: () => {
                set({
                    startTime: null,
                    sessionId: null,
                    routineId: null,
                    routineTitle: null,
                    dayId: null,
                    dayTitle: null,
                    exercises: [],
                    activeExerciseId: null,
                });
                localStorage.removeItem("workout-storage");
            },

            cancelWorkout: () => {
                set({
                    startTime: null,
                    sessionId: null,
                    routineId: null,
                    routineTitle: null,
                    dayId: null,
                    dayTitle: null,
                    exercises: [],
                    activeExerciseId: null,
                });
                localStorage.removeItem("workout-storage");
            },
        }),
        {
            name: "workout-storage",
        }
    )
);
