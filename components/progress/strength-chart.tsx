"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { calculateOneRM } from "@/lib/fitness-utils";
import type { RoutineLog } from "@/lib/types";

type Props = {
  logs: RoutineLog[];
};

const parseWeight = (val: string | number | undefined): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const match = val.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
};

export default function StrengthChart({ logs }: Props) {
  const exerciseStats = useMemo(() => {
    const stats = new Map<string, { count: number; maxWeight: number }>();

    logs.forEach((log) => {
      log.entries.forEach((entry) => {
        const name = entry.exerciseName || "Desconocido";
        const current = stats.get(name) || { count: 0, maxWeight: 0 };

        let maxW = 0;
        entry.sets?.forEach((s) => {
          const w = parseWeight(s.weight);
          if (w > maxW) maxW = w;
        });

        stats.set(name, {
          count: current.count + 1,
          maxWeight: Math.max(current.maxWeight, maxW),
        });
      });
    });

    return Array.from(stats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name]) => name);
  }, [logs]);

  const [selectedExercise, setSelectedExercise] = useState<string>("");

  useEffect(() => {
    if (!selectedExercise && exerciseStats.length > 0) {
      setSelectedExercise(exerciseStats[0]);
    }
  }, [exerciseStats, selectedExercise]);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    const dataPoints: Array<{ date: string; oneRM: number; weight: number }> = [];
    const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedLogs.forEach((log) => {
      const entry = log.entries.find((e) => e.exerciseName === selectedExercise);
      if (!entry || !entry.sets) return;

      let best1RM = 0;
      let bestWeight = 0;

      entry.sets.forEach((set) => {
        const weight = parseWeight(set.weight);
        const reps = Number(set.reps) || 0;

        if (weight > 0 && reps > 0) {
          const orm = calculateOneRM(weight, reps);
          if (orm > best1RM) {
            best1RM = orm;
            bestWeight = weight;
          }
        }
      });

      if (best1RM > 0) {
        dataPoints.push({
          date: new Date(log.date).toLocaleDateString(),
          oneRM: best1RM,
          weight: bestWeight,
        });
      }
    });

    return dataPoints;
  }, [logs, selectedExercise]);

  if (logs.length === 0) {
    return <div className="text-center sf-text-body text-apple-near-black/60 dark:text-white/60">No hay registros de entreno aun.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <select
          className="w-full rounded-xl border border-apple-near-black/12 bg-white px-3 py-2 sf-text-caption text-apple-near-black md:w-64 dark:border-white/12 dark:bg-apple-surface-1 dark:text-white"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {exerciseStats.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <p className="sf-text-caption text-apple-near-black/58 dark:text-white/58">Mostrando progresion de 1RM estimado (Epley)</p>
      </div>

      <div className="h-72 w-full">
        {chartData.length > 1 ? (
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 113, 227, 0.14)" />
              <XAxis dataKey="date" stroke="#8d8d93" tick={{ fontSize: 12 }} />
              <YAxis stroke="#1d1d1f" tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 10px 24px -18px rgba(0,0,0,0.45)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line name="1RM estimado" type="monotone" dataKey="oneRM" stroke="#0071e3" strokeWidth={2.4} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line name="Peso movido" type="monotone" dataKey="weight" stroke="#6aa9ff" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-apple-near-black/12 bg-white/75 sf-text-body text-apple-near-black/60 dark:border-white/12 dark:bg-apple-surface-1/65 dark:text-white/60">
            Datos insuficientes para graficar (minimo 2 sesiones).
          </div>
        )}
      </div>
    </div>
  );
}