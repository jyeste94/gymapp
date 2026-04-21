"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { RoutineLog } from "@/lib/types";
import { calculateWeeklyVolume } from "@/lib/stats-helpers";

type Props = {
  logs: RoutineLog[];
};

export default function VolumeChart({ logs }: Props) {
  const data = useMemo(() => calculateWeeklyVolume(logs), [logs]);

  const getBarColor = (sets: number) => {
    if (sets < 10) return "#cde4ff";
    if (sets < 20) return "#6aa9ff";
    return "#0071e3";
  };

  if (logs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-apple-near-black/12 bg-white/75 sf-text-body text-apple-near-black/60 dark:border-white/12 dark:bg-apple-surface-1/65 dark:text-white/60">
        Registra entrenamientos para ver tu volumen semanal.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 113, 227, 0.14)" vertical={false} />
          <XAxis dataKey="week" stroke="#8d8d93" tick={{ fontSize: 11 }} interval={0} tickMargin={10} />
          <YAxis stroke="#1d1d1f" tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: "rgba(0,113,227,0.08)" }}
            contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 10px 24px -18px rgba(0,0,0,0.45)" }}
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