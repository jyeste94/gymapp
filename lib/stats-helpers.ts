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

export function calculateWeeklyVolume(logs: RoutineLog[]) {
    const weeklyMap = new Map<string, number>();

    // Process logs from oldest to newest for chronological chart
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedLogs.forEach(log => {
        if (!log.date) return;
        const date = new Date(log.date);

        // Simple week formatter: "Jan 22 (W4)" or just "Week 4"
        // Let's use start of week date for clearer X-Axis
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const startOfWeek = new Date(date.setDate(diff));
        const weekLabel = startOfWeek.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

        const currentSets = weeklyMap.get(weekLabel) || 0;

        // Count sets
        let setsInLog = 0;
        log.entries?.forEach(e => {
            if (e.sets) setsInLog += e.sets.length;
        });

        weeklyMap.set(weekLabel, currentSets + setsInLog);
    });

    return Array.from(weeklyMap.entries()).map(([week, sets]) => ({
        week,
        sets
    }));
}

import { defaultExercises } from "@/lib/data/exercises";

export function calculateMuscleDistribution(logs: RoutineLog[]) {
    const muscleCounts: Record<string, number> = {};

    // Cache exercise definitions for faster lookup
    const exerciseMap = new Map(defaultExercises.map(e => [e.name, e]));
    const exerciseIdMap = new Map(defaultExercises.map(e => [e.id, e]));

    logs.forEach(log => {
        log.entries.forEach(entry => {
            // Try to find exercise definition
            // First by ID (if we stored it correctly), then by Name
            let exercise = exerciseIdMap.get(entry.exerciseId);
            if (!exercise) {
                exercise = exerciseMap.get(entry.exerciseName);
            }

            if (exercise && exercise.muscleGroup) {
                const sets = entry.sets.length;

                // Distribute volume across all primary muscles
                exercise.muscleGroup.forEach(muscle => {
                    muscleCounts[muscle] = (muscleCounts[muscle] || 0) + sets;
                });
            }
        });
    });

    return muscleCounts;
}
