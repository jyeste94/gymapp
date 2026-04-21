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

        const sortedLogs = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sortedLogs.map((log) => {
            const maxWeight = log.sets.reduce((max, set) => {
                const weight = parseFloat(set.weight || "0");
                return weight > max ? weight : max;
            }, 0);

            if (maxWeight <= 0) return null;

            return {
                date: new Date(log.date),
                weight: maxWeight,
                formattedDate: format(new Date(log.date), "d MMM", { locale: es }),
            };
        }).filter(Boolean);
    }, [data]);

    if (chartData.length === 0) {
        return null;
    }

    return (
        <div className="w-full space-y-4 rounded-3xl border-none bg-apple-gray dark:bg-apple-surface-2 p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">Progresión de Carga (kg)</h3>

            {chartData.length === 1 && chartData[0] ? (
                <div className="flex h-[200px] w-full flex-col items-center justify-center space-y-2 text-apple-near-black/60 dark:text-white/60">
                    <div className="sf-display-hero text-apple-near-black dark:text-white">{chartData[0].weight} <span className="sf-text-body font-normal text-apple-near-black/60 dark:text-white/60">kg</span></div>
                    <div className="sf-text-caption">Récord actual ({chartData[0].formattedDate})</div>
                    <div className="sf-text-nano opacity-70">¡Registra más sesiones para ver tu progreso!</div>
                </div>
            ) : (
                <div className="h-[200px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                            <XAxis
                                dataKey="formattedDate"
                                tick={{ fontSize: 10, fill: "#8E8E93", fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: "#8E8E93", fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                                width={35}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    borderRadius: "16px",
                                    border: "none",
                                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                                    backdropFilter: "blur(20px)"
                                }}
                                labelStyle={{ fontSize: "12px", color: "#8E8E93", marginBottom: "4px", fontWeight: 500 }}
                                itemStyle={{ fontSize: "16px", fontWeight: 600, color: "#1D1D1F" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#0071E3"
                                strokeWidth={3}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "#0071E3" }}
                                dot={{ r: 4, fill: "#0071E3", strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
