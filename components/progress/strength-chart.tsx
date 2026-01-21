"use client";
import { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { calculateOneRM } from "@/lib/fitness-utils";
import type { RoutineLog } from "@/lib/types";

type Props = {
    logs: RoutineLog[];
};

export default function StrengthChart({ logs }: Props) {
    // Extract all exercises found in logs
    const exerciseStats = useMemo(() => {
        const stats = new Map<string, { count: number; maxWeight: number }>();

        logs.forEach(log => {
            log.entries.forEach(entry => {
                const name = entry.exerciseName || "Desconocido";
                const current = stats.get(name) || { count: 0, maxWeight: 0 };

                let maxW = 0;
                entry.sets?.forEach(s => {
                    const w = s.weight || 0;
                    if (w > maxW) maxW = w;
                });

                stats.set(name, {
                    count: current.count + 1,
                    maxWeight: Math.max(current.maxWeight, maxW)
                });
            });
        });

        return Array.from(stats.entries())
            .sort((a, b) => b[1].count - a[1].count) // Sort by popularity
            .map(([name]) => name);
    }, [logs]);

    const [selectedExercise, setSelectedExercise] = useState<string>(
        exerciseStats[0] || ""
    );

    // If initial load has exercises but none selected, select first
    if (!selectedExercise && exerciseStats.length > 0) {
        setSelectedExercise(exerciseStats[0]);
    }

    const chartData = useMemo(() => {
        if (!selectedExercise) return [];

        const dataPoints: Array<{ date: string; oneRM: number; weight: number }> = [];

        // Iterate logs in reverse (assuming desc order in logs) -> actually we want time ascending for chart
        // logs are desc by default from hook
        const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedLogs.forEach(log => {
            const entry = log.entries.find(e => e.exerciseName === selectedExercise);
            if (!entry || !entry.sets) return;

            // Find best set for 1RM calculation in this session
            let best1RM = 0;
            let bestWeight = 0;

            entry.sets.forEach(set => {
                const weight = set.weight || 0;
                const reps = set.reps || 0;

                if (weight > 0 && reps > 0) {
                    const orm = calculateOneRM(weight, reps);
                    if (orm > best1RM) {
                        best1RM = orm;
                        bestWeight = weight;
                    }
                }
            });

            if (best1RM > 0) {
                dataPoints.push({
                    date: new Date(log.date).toLocaleDateString(),
                    oneRM: best1RM,
                    weight: bestWeight
                });
            }
        });

        return dataPoints;

    }, [logs, selectedExercise]);

    if (logs.length === 0) {
        return <div className="text-center text-sm text-[#4b5a72]">No hay registros de entreno aun.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <select
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm md:w-64"
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                >
                    {exerciseStats.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
                <p className="text-xs text-[#51607c]">
                    Mostrando progresion de 1RM estimado (Epley)
                </p>
            </div>

            <div className="h-72 w-full">
                {chartData.length > 1 ? (
                    <ResponsiveContainer>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 99, 255, 0.12)" />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#0a2e5c" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
                            <Tooltip contentStyle={{ borderRadius: 16 }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line name="1RM Estimado" type="monotone" dataKey="oneRM" stroke="#0a2e5c" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                            <Line name="Peso movido" type="monotone" dataKey="weight" stroke="#6aa9ff" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 text-sm text-[#4b5a72]">
                        Datos insuficientes para graficar (minimo 2 sesiones).
                    </div>
                )}
            </div>
        </div>
    );
}
