"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ExerciseLog } from "@/lib/firestore/exercise-logs";
import { useChartTheme } from "@/lib/chart-theme";

type Props = { data: ExerciseLog[] };

export default function ExerciseProgressChart({ data }: Props) {
  const theme = useChartTheme();

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sortedLogs = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sortedLogs.map((log) => {
      const maxWeight = log.sets.reduce((max, set) => { const w = parseFloat(set.weight || "0"); return w > max ? w : max; }, 0);
      if (maxWeight <= 0) return null;
      return { date: new Date(log.date), weight: maxWeight, formattedDate: format(new Date(log.date), "d MMM", { locale: es }) };
    }).filter(Boolean);
  }, [data]);

  return (
    <div className="w-full space-y-4 rounded-3xl border-none bg-apple-gray dark:bg-apple-surface-2 p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
      <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">Progresión de Carga (kg)</h3>

      {chartData.length === 0 ? (
        <div className="flex h-[120px] items-center justify-center rounded-2xl border border-dashed border-apple-near-black/12 text-sm text-apple-near-black/50 dark:border-white/12 dark:text-white/50">
          No tienes registros previos. Guarda tu primer entrenamiento para ver la progresión.
        </div>
      ) : chartData.length === 1 && chartData[0] ? (
        <div className="flex h-[200px] w-full flex-col items-center justify-center space-y-2 text-apple-near-black/60 dark:text-white/60">
          <div className="sf-display-hero text-apple-near-black dark:text-white">{chartData[0].weight} <span className="sf-text-body font-normal text-apple-near-black/60 dark:text-white/60">kg</span></div>
          <div className="sf-text-caption">Récord actual ({chartData[0].formattedDate})</div>
          <div className="sf-text-nano opacity-70">¡Registra más sesiones para ver tu progreso!</div>
        </div>
      ) : (
        <div className="h-[200px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.grid} />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 10, fill: theme.axis, fontWeight: 500 }} axisLine={false} tickLine={false} minTickGap={30} />
              <YAxis tick={{ fontSize: 10, fill: theme.axis, fontWeight: 500 }} axisLine={false} tickLine={false} width={35} />
              <Tooltip
                contentStyle={{
                  ...theme.tooltip.contentStyle,
                  backdropFilter: "blur(20px)",
                }}
                labelStyle={theme.tooltip.labelStyle}
                itemStyle={theme.tooltip.itemStyle}
              />
              <Line type="monotone" dataKey="weight" stroke={theme.blue} strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: theme.blue }} dot={{ r: 4, fill: theme.blue, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
