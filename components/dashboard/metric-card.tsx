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
    <div className="apple-panel-muted flex min-w-[140px] flex-col gap-3 p-4">
      <div className="flex items-start justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-apple-blue/10 text-apple-blue">
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <div
            className={clsx(
              "flex items-center gap-0.5 sf-text-nano",
              trend.direction === "up" && "text-[#34c759]",
              trend.direction === "down" && "text-[#ff3b30]",
              trend.direction === "neutral" && "text-apple-near-black/50 dark:text-white/50",
            )}
          >
            <span>{trendSymbol}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
      <div>
        <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">{label}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="sf-text-subheading text-apple-near-black dark:text-white">{value}</span>
          {unit && <span className="sf-text-caption text-apple-near-black/55 dark:text-white/55">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
