"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { RoutineLog } from "@/lib/types";
import { calculateMuscleDistribution } from "@/lib/stats-helpers";

type Props = {
  logs: RoutineLog[];
};

const MUSCLE_COLORS = ["#0071e3", "#0a84ff", "#2997ff", "#6aa9ff", "#8fc2ff", "#b7d9ff", "#d2e8ff", "#e5f1ff"];

export default function MuscleVolumeChart({ logs }: Props) {
  const data = useMemo(() => {
    const muscleCounts = calculateMuscleDistribution(logs);
    return Object.entries(muscleCounts)
      .map(([name, value]) => ({ name, value }))
      .filter((entry) => entry.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  if (logs.length === 0 || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-apple-near-black/12 bg-white/75 sf-text-body text-apple-near-black/60 dark:border-white/12 dark:bg-apple-surface-1/65 dark:text-white/60">
        Registra entrenamientos para ver tu balance muscular.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={MUSCLE_COLORS[index % MUSCLE_COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 14, border: "1px solid rgba(0, 0, 0, 0.1)", boxShadow: "0 10px 24px -18px rgba(0,0,0,0.45)" }}
            formatter={(value: number) => [`${value} series`, "Volumen"]}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "11px" }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}