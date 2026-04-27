"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { RoutineLog } from "@/lib/types";
import { calculateMuscleDistribution } from "@/lib/stats-helpers";
import { useChartTheme } from "@/lib/chart-theme";

type Props = { logs: RoutineLog[] };

export default function MuscleVolumeChart({ logs }: Props) {
  const theme = useChartTheme();

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
              <Cell key={`cell-${index}`} fill={theme.pieColors[index % theme.pieColors.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={theme.tooltip.contentStyle}
            formatter={(value: number) => [`${value} series`, "Volumen"]}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "11px", color: theme.axis }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
