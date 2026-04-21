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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 113, 227, 0.14)" />
          <XAxis dataKey="date" stroke="#8d8d93" tick={{ fontSize: 12 }} interval={chart.length > 10 ? Math.floor(chart.length / 6) : 0} />
          <YAxis yAxisId="left" stroke="#1d1d1f" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#6aa9ff" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "0 10px 24px -18px rgba(0,0,0,0.45)",
            }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, marginTop: 8 }} />
          <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso" stroke="#0071e3" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="fat" name="Grasa" stroke="#6aa9ff" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}