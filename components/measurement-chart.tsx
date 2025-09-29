"use client";
import { Measurement } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function MeasurementChart({ data }: { data: Measurement[] }) {
  const chart = [...data].reverse().map((item) => ({
    date: new Date(item.date).toLocaleDateString(),
    weight: item.weightKg,
    fat: item.bodyFatPct ?? null,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <LineChart data={chart}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(34, 99, 255, 0.12)" />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={chart.length > 10 ? Math.floor(chart.length / 6) : 0} />
          <YAxis yAxisId="left" stroke="#0a2e5c" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#ffae00" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(10,46,92,0.18)", boxShadow: "0 12px 30px -18px rgba(10,46,92,0.32)" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, marginTop: 8 }} />
          <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#0a2e5c" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="fat" stroke="#ffae00" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


