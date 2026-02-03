"use client";

import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";
import type { RoutineLog } from "@/lib/types";
import { calculateMuscleDistribution } from "@/lib/stats-helpers";

type Props = {
    logs: RoutineLog[];
};

// Map muscle groups to colors
const MUSCLE_COLORS: Record<string, string> = {
    "Pecho": "#ef4444", // Red
    "Espalda": "#3b82f6", // Blue
    "Hombro": "#f59e0b", // Amber
    "Biceps": "#10b981", // Emerald
    "Triceps": "#8b5cf6", // Violet
    "Cuadriceps": "#ec4899", // Pink
    "Isquios": "#6366f1", // Indigo
    "Gluteos": "#f43f5e", // Rose
    "Gemelos": "#14b8a6", // Teal
    "Core": "#64748b", // Slate
    "Cardio": "#06b6d4", // Cyan
};

export default function MuscleVolumeChart({ logs }: Props) {
    const data = useMemo(() => {
        const muscleCounts = calculateMuscleDistribution(logs);

        // Convert to array for Recharts
        return Object.entries(muscleCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Sort descending

    }, [logs]);

    if (logs.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 text-sm text-[#4b5a72]">
                Registra entrenamientos para ver tu balance muscular.
            </div>
        );
    }

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={MUSCLE_COLORS[entry.name] || "#9ca3af"}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        formatter={(value: number) => [`${value} series`, "Volumen"]}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '11px' }}
                        iconType="circle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
