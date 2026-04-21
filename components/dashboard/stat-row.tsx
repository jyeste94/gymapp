"use client";
import type { Measurement } from "@/lib/types";

type StatRowProps = {
  measurements: Measurement[];
  loading: boolean;
};

export default function StatRow({ measurements, loading }: StatRowProps) {
  const lastMeasurement = measurements[0];

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const stats = [
    {
      label: "Ultimo peso",
      value: lastMeasurement ? `${lastMeasurement.weightKg.toFixed(1)}` : "--",
      unit: "kg",
      subtext: lastMeasurement ? formatDate(lastMeasurement.date) : "Sin datos",
    },
    {
      label: "% grasa",
      value: lastMeasurement?.bodyFatPct ? `${lastMeasurement.bodyFatPct.toFixed(1)}` : "--",
      unit: "%",
      subtext: "Estimado",
    },
    {
      label: "Pecho",
      value: lastMeasurement?.chest ? `${lastMeasurement.chest}` : "--",
      unit: "cm",
      subtext: "Pectoral",
    },
    {
      label: "Cintura",
      value: lastMeasurement?.waist ? `${lastMeasurement.waist}` : "--",
      unit: "cm",
      subtext: "Abdomen",
    },
  ];

  if (loading) return <div className="h-24 w-full animate-pulse rounded-2xl bg-white/70 dark:bg-apple-surface-1/60" />;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl border border-apple-near-black/10 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-apple-surface-1">
          <div className="absolute right-0 top-0 h-16 w-16 -translate-y-1/2 translate-x-1/2 rounded-full bg-apple-blue/12 blur-xl" />

          <p className="apple-kicker">{stat.label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-apple-near-black dark:text-white">{stat.value}</span>
            <span className="sf-text-nano text-apple-near-black/45 dark:text-white/45">{stat.unit}</span>
          </div>
          <p className="mt-1 sf-text-caption text-apple-near-black/55 dark:text-white/55">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
}