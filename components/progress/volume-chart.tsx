"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import type { RoutineLog } from "@/lib/types";
import { calculateWeeklyVolume } from "@/lib/stats-helpers";

type Props = {
    logs: RoutineLog[];
};

export default function VolumeChart({ logs }: Props) {
    const data = useMemo(() => calculateWeeklyVolume(logs), [logs]);

    // Generate some dynamic colors based on intensity
    const getBarColor = (sets: number) => {
        if (sets < 10) return "#93c5fd"; // light blue
        if (sets < 20) return "#60a5fa"; // blue
        return "#2563eb"; // dark blue
    };

    if (logs.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 text-sm text-[#4b5a72]">
                Registra entrenamientos para ver tu volumen semanal.
            </div>
        );
    }

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 99, 255, 0.12)" vertical={false} />
                    <XAxis
                        dataKey="week"
                        stroke="#94a3b8"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        tickMargin={10}
                    />
                    <YAxis
                        stroke="#0a2e5c"
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(10,46,92,0.05)' }}
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="sets" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.sets)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
