import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

type Props = {
    icon: LucideIcon;
    label: string;
    value: string;
    unit?: string;
    trend?: {
        value: string;
        direction: "up" | "down" | "neutral";
    };
};

export default function MetricCard({ icon: Icon, label, value, unit, trend }: Props) {
    const trendSymbol = trend?.direction === "up" ? "+" : trend?.direction === "down" ? "-" : "=";

    return (
        <div className="flex min-w-[140px] flex-col gap-3 rounded-2xl border border-brand-border bg-brand-surface p-4">
            <div className="flex items-start justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-dark text-brand-primary">
                    <Icon className="h-4 w-4" />
                </div>
                {trend && (
                    <div className={clsx(
                        "flex items-center gap-0.5 text-[10px] font-medium",
                        trend.direction === "up" && "text-brand-primary",
                        trend.direction === "down" && "text-red-400",
                        trend.direction === "neutral" && "text-brand-text-muted"
                    )}>
                        <span>{trendSymbol}</span>
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs text-brand-text-muted">{label}</p>
                <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-brand-text-main">{value}</span>
                    {unit && <span className="text-xs text-brand-text-muted">{unit}</span>}
                </div>
            </div>
        </div>
    );
}
