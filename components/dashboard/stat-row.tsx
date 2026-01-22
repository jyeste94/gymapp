"use client";
import type { Measurement } from "@/lib/types";

type StatRowProps = {
    measurements: Measurement[];
    loading: boolean;
};

export default function StatRow({ measurements, loading }: StatRowProps) {
    const lastMeasurement = measurements[0];

    // Helper to format date
    const formatDate = (iso?: string) => {
        if (!iso) return "-";
        return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    };

    const stats = [
        {
            label: "Último Peso",
            value: lastMeasurement ? `${lastMeasurement.weightKg.toFixed(1)}` : "--",
            unit: "kg",
            subtext: lastMeasurement ? formatDate(lastMeasurement.date) : "Sin datos",
            color: "amber",
        },
        {
            label: "% Grasa",
            value: lastMeasurement?.bodyFatPct ? `${lastMeasurement.bodyFatPct.toFixed(1)}` : "--",
            unit: "%",
            subtext: "Estimado",
            color: "rose",
        },
        {
            label: "Pecho",
            value: lastMeasurement?.chest ? `${lastMeasurement.chest}` : "--",
            unit: "cm",
            subtext: "Pectoral",
            color: "blue",
        },
        {
            label: "Cintura",
            value: lastMeasurement?.waist ? `${lastMeasurement.waist}` : "--",
            unit: "cm",
            subtext: "Abdomen",
            color: "indigo",
        }
    ];

    if (loading) return <div className="h-24 w-full animate-pulse rounded-2xl bg-white/50" />;

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="relative overflow-hidden rounded-2xl border border-[rgba(10,46,92,0.1)] bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                    <div className={`absolute right-0 top-0 h-16 w-16 -translate-y-1/2 translate-x-1/2 rounded-full opacity-10 blur-xl bg-${stat.color}-500`} />

                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{stat.label}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-[#0a2e5c]">{stat.value}</span>
                        <span className="text-xs font-semibold text-zinc-400">{stat.unit}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{stat.subtext}</p>
                </div>
            ))}
        </div>
    );
}
