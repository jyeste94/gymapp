"use client";

import { useMemo } from "react";
import Model from "react-body-highlighter";
import type { RoutineLog } from "@/lib/types";
import { calculateMuscleDistribution } from "@/lib/stats-helpers";

type Props = {
    logs: RoutineLog[];
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
        <div className="flex flex-col items-center justify-center gap-8 py-6 md:flex-row md:items-start md:justify-around">

            {/* Front View */}
            <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-bold uppercase text-zinc-400 tracking-widest">Frente</p>
                <Model
                    data={data as any}
                    type="anterior"
                    style={{ width: '12rem', height: '20rem' }}
                    highlightedColors={HIGHLIGHT_COLORS}
                />
            </div>

            {/* Back View */}
            <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-bold uppercase text-zinc-400 tracking-widest">Espalda</p>
                <Model
                    data={data as any}
                    type="posterior"
                    style={{ width: '12rem', height: '20rem' }}
                    highlightedColors={HIGHLIGHT_COLORS}
                />
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 p-4 md:self-center">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
                    <span className="text-xs text-zinc-600">Alta intensidad (12+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#fb923c]" />
                    <span className="text-xs text-zinc-600">Media (5-11)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#fde047]" />
                    <span className="text-xs text-zinc-600">Mantenimiento (1-4)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#3f3f46]" />
                    <span className="text-xs text-zinc-400">Sin entrenar</span>
                </div>
            </div>

        </div>
    );
}
