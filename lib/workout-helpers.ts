import type { ActiveExercise, WorkoutSet } from "@/lib/stores/workout-session";

export type SavedSet = {
    weight: number;
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
        sets: ex.sets.filter(s => s.completed || Number(s.reps) > 0 || Number(s.weight) > 0).map(s => ({
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
            rir: Number(s.rir) || 0,
        }))
    })).filter(e => e.sets.length > 0);
}
