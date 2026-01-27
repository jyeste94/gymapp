import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoutineExercise } from "@/lib/types";

export type WorkoutSet = {
    id: string;
    weight: string;
    reps: string;
    rir: string;
    completed: boolean;
};

export type ActiveExercise = Omit<RoutineExercise, "sets"> & {
    sets: WorkoutSet[];
    originalSets: number; // Keep track of the target sets
    notes?: string;
};

type WorkoutState = {
    startTime: number | null;
    routineId: string | null;
    routineTitle: string | null;
    dayId: string | null;
    dayTitle: string | null;
    exercises: ActiveExercise[];
    activeExerciseId: string | null;

    // Actions
    startWorkout: (params: {
        routineId: string;
        routineTitle: string;
        dayId: string;
        dayTitle: string;
        exercises: RoutineExercise[];
        history?: Record<string, { weight: string, reps: string }[]>;
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
            routineId: null,
            routineTitle: null,
            dayId: null,
            dayTitle: null,
            exercises: [],
            activeExerciseId: null,

            startWorkout: ({ routineId, routineTitle, dayId, dayTitle, exercises, history }) => {
                set({
                    startTime: Date.now(),
                    routineId,
                    routineTitle,
                    dayId,
                    dayTitle,
                    exercises: exercises.map((ex) => {
                        const previousSets = history?.[ex.id] ?? [];
                        // Find the last valid weight used in previous session to use as fallback
                        const lastValidWeight = previousSets.length > 0
                            ? previousSets[previousSets.length - 1].weight
                            : "";

                        return {
                            ...ex,
                            originalSets: ex.sets,
                            sets: Array.from({ length: ex.sets || 3 }).map((_, idx) => ({
                                id: crypto.randomUUID(),
                                // Pre-fill weight from history if available, otherwise use last valid weight, otherwise empty
                                weight: previousSets[idx]?.weight ?? lastValidWeight,
                                reps: "", // We don't pre-fill reps to encourage logging actual performance
                                rir: "",
                                completed: false,
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

            toggleSetComplete: (exerciseId, setId) => {
                set((state) => ({
                    exercises: state.exercises.map((ex) =>
                        ex.id === exerciseId
                            ? {
                                ...ex,
                                sets: ex.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
                            }
                            : ex
                    ),
                }));
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
                                        id: crypto.randomUUID(),
                                        weight: ex.sets[ex.sets.length - 1]?.weight ?? "",
                                        reps: ex.sets[ex.sets.length - 1]?.reps ?? "",
                                        rir: "",
                                        completed: false,
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
                get().finishWorkout();
            },
        }),
        {
            name: "workout-storage",
        }
    )
);
