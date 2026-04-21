"use client";

import { useMemo } from "react";
import { Trophy } from "lucide-react";
import type { RoutineLog } from "@/lib/types";

type Props = {
  routineId: string;
  logs: RoutineLog[];
  minimal?: boolean;
};

export default function RoutineHistoryCard({ routineId, logs, minimal = false }: Props) {
  const completionCount = useMemo(
    () => logs.filter((log) => log.routineId === routineId).length,
    [logs, routineId],
  );

  if (completionCount === 0 && minimal) return null;

  if (minimal) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-apple-near-black/10 bg-white px-3 py-1 sf-text-caption-strong text-apple-near-black/75 dark:border-white/15 dark:bg-apple-surface-2 dark:text-white/75">
        <Trophy className="h-3.5 w-3.5 text-apple-blue" />
        <span>{completionCount} completada(s)</span>
      </div>
    );
  }

  return (
    <div className="apple-panel-muted flex items-center gap-4 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-apple-blue/10 text-apple-blue">
        <Trophy className="h-5 w-5" />
      </div>
      <div>
        <p className="apple-kicker">Historial</p>
        <p className="sf-text-body text-apple-near-black dark:text-white">
          Has completado esta rutina <span className="sf-text-body-emphasis">{completionCount}</span> veces.
        </p>
      </div>
    </div>
  );
}
