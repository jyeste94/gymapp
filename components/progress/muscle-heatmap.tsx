"use client";

import { useMemo } from "react";
import Model from "react-body-highlighter";
import type { RoutineLog } from "@/lib/types";
import type { ExerciseLog } from "@/lib/firestore/exercise-logs";
import { calculateMuscleDistribution } from "@/lib/stats-helpers";

type Props = {
    logs: (RoutineLog | ExerciseLog)[];
};

// Map Spanish app muscles to Library english slugs
const MUSCLE_MAPPING: Record<string, string[]> = {
    "Pecho": ["chest"],
    "Espalda": ["trapezius", "upper-back", "lower-back"],
    "Hombro": ["front-deltoids", "back-deltoids"],
    "Biceps": ["biceps"],
    "Triceps": ["triceps"],
    "Cuadriceps": ["quadriceps"],
    "Isquios": ["hamstring"],
    "Gluteos": ["gluteal"],
    "Gemelos": ["calves"],
    "Core": ["abs", "obliques"],
    // Cardio ignored
};

// Intensity Colors
// Level 1: Maintenance (Yellow-300)
// Level 2: Good (Orange-400)
// Level 3: High (Red-500)
const HIGHLIGHT_COLORS = ["#fde047", "#fb923c", "#ef4444"];

const getFrequency = (sets: number) => {
    if (sets < 5) return 1;
    if (sets < 12) return 2;
    return 3;
};

export default function MuscleHeatmap({ logs }: Props) {
    const muscleCounts = useMemo(() => calculateMuscleDistribution(logs), [logs]);

    const data = useMemo(() => {
        const result: { name: string; muscles: string[]; frequency: number }[] = [];

        Object.entries(muscleCounts).forEach(([muscleName, sets]) => {
            if (sets === 0) return;

            const slugs = MUSCLE_MAPPING[muscleName];
            if (slugs) {
                result.push({
                    name: muscleName,
                    muscles: slugs,
                    frequency: getFrequency(sets),
                });
            }
        });

        return result;
    }, [muscleCounts]);



    return (
        <div className="flex flex-col items-center gap-6 py-4">

            {/* Models Row */}
            <div className="flex flex-row items-start justify-center gap-8 sm:gap-12">
                {/* Front View */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Frente</p>
                    <Model
                        data={data as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                        type="anterior"
                        style={{ width: '8rem', height: '14rem' }}
                        highlightedColors={HIGHLIGHT_COLORS}
                    />
                </div>

                {/* Back View */}
                <div className="flex flex-col items-center gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Espalda</p>
                    <Model
                        data={data as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                        type="posterior"
                        style={{ width: '8rem', height: '14rem' }}
                        highlightedColors={HIGHLIGHT_COLORS}
                    />
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 rounded-xl bg-zinc-50 px-4 py-3">
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                    <span className="text-[10px] text-zinc-600">Alta</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#fb923c]" />
                    <span className="text-[10px] text-zinc-600">Media</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#fde047]" />
                    <span className="text-[10px] text-zinc-600">Baja</span>
                </div>
            </div>

        </div>
    );
}
