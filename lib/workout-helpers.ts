import type { ActiveExercise } from "@/lib/stores/workout-session";

export type SavedSet = {
    weight: string;
    reps: number;
    rir: number;
};

export type SavedWorkoutEntry = {
    exerciseId: string;
    exerciseName: string;
    sets: SavedSet[];
};

export function getExercisesToSave(exercises: ActiveExercise[]): SavedWorkoutEntry[] {
    return exercises.map(ex => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: ex.sets.filter(s => s.completed || Number(s.reps) > 0 || (s.weight && s.weight.trim() !== "")).map(s => ({
            weight: s.weight?.toString() || "",
            reps: Number(s.reps) || 0,
            rir: Number(s.rir) || 0,
        }))
    })).filter(e => e.sets.length > 0);
}
