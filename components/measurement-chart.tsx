"use client";
import { Measurement } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MeasurementChart({ data }: { data: Measurement[] }) {
  const chart = [...data].reverse().map(d => ({
    date: new Date(d.date).toLocaleDateString(),
    weight: d.weightKg,
    fat: d.bodyFatPct ?? null
  }));

  return (
    <div className="rounded-2xl border p-4">
      <h3 className="font-semibold mb-2">Peso / % Grasa</h3>
      <div className="h-72">
        <ResponsiveContainer>
          <LineChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="weight" />
            <Line yAxisId="right" type="monotone" dataKey="fat" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
