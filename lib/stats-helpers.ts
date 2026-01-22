import type { RoutineLog } from "@/lib/types";

export type StatsSummary = {
    totalWorkouts: number;
    lastWorkoutDate?: string;
    totalVolume: number;
};

export function calculateStats(routineLogs: RoutineLog[]): StatsSummary {
    const totalWorkouts = routineLogs.length;
    const lastWorkout = routineLogs[0]; // Assuming sorted by date desc

    const totalVolume = routineLogs.reduce((acc, log) => {
        if (!log.entries) return acc;

        log.entries.forEach(e => {
            if (!e.sets) return;

            e.sets.forEach(s => {
                const w = Number(s.weight) || 0;
                const r = Number(s.reps) || 0;
                acc += w * r;
            });
        });
        return acc;
    }, 0);

    return {
        totalWorkouts,
        lastWorkoutDate: lastWorkout?.date,
        totalVolume
    };
}
