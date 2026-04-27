"use client";
import { Measurement } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useChartTheme } from "@/lib/chart-theme";

export default function MeasurementChart({ data }: { data: Measurement[] }) {
  const theme = useChartTheme();

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-apple-near-black/12 text-sm text-apple-near-black/50 dark:border-white/12 dark:text-white/50">
        No hay mediciones registradas.
      </div>
    );
  }

  const chart = [...data].reverse().map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    weight: item.weightKg,
    fat: item.bodyFatPct ?? null,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={chart}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
          <XAxis dataKey="date" stroke={theme.axis} tick={{ fontSize: 12 }} interval={chart.length > 10 ? Math.floor(chart.length / 6) : 0} />
          <YAxis yAxisId="left" stroke={theme.axisY} tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke={theme.blueLight} tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={theme.tooltip.contentStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, marginTop: 8, color: theme.axis }} />
          <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso" stroke={theme.blue} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="fat" name="Grasa" stroke={theme.blueLight} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
