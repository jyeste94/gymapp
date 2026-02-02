"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ExerciseLog } from "@/lib/firestore/exercise-logs";

type Props = {
    data: ExerciseLog[];
};

export default function ExerciseProgressChart({ data }: Props) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Sort logs chronologically (oldest to newest) for the chart
        const sortedLogs = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sortedLogs.map((log) => {
            // Find the max weight lifted in this session
            const maxWeight = log.sets.reduce((max, set) => {
                const weight = parseFloat(set.weight || "0");
                return weight > max ? weight : max;
            }, 0);

            // Only include if there was actual weight lifted
            if (maxWeight <= 0) return null;

            return {
                date: new Date(log.date),
                weight: maxWeight,
                formattedDate: format(new Date(log.date), "d MMM", { locale: es }),
            };
        }).filter(Boolean); // Remove nulls
    }, [data]);

    if (chartData.length === 0) {
        return null;
    }

    return (
        <div className="w-full space-y-2 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-zinc-900">Progresión de Carga (kg)</h3>

            {chartData.length === 1 && chartData[0] ? (
                <div className="flex h-[200px] w-full flex-col items-center justify-center space-y-2 text-[#71717a]">
                    <div className="text-3xl font-bold text-[#0a2e5c]">{chartData[0].weight} <span className="text-sm font-normal">kg</span></div>
                    <div className="text-xs">Récord actual ({chartData[0].formattedDate})</div>
                    <div className="text-[10px] opacity-70">¡Registra más sesiones para ver tu progreso!</div>
                </div>
            ) : (
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis
                                dataKey="formattedDate"
                                tick={{ fontSize: 10, fill: "#71717a" }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#71717a" }}
                                axisLine={false}
                                tickLine={false}
                                width={35}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#fff",
                                    borderRadius: "8px",
                                    border: "1px solid #e4e4e7",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                                }}
                                labelStyle={{ fontSize: "12px", color: "#71717a", marginBottom: "4px" }}
                                itemStyle={{ fontSize: "14px", fontWeight: 600, color: "#0a2e5c" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#2563eb"
                                strokeWidth={2}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                                dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
