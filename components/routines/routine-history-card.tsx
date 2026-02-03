"use client";

import { useMemo } from "react";
import type { RoutineLog } from "@/lib/types";
import { Trophy } from "lucide-react";

type Props = {
    routineId: string;
    logs: RoutineLog[];
    minimal?: boolean;
};

export default function RoutineHistoryCard({ routineId, logs, minimal = false }: Props) {
    const completionCount = useMemo(() => {
        // Count logs that match this routine ID directly
        // Or could match by name if ID was lost/migrated, but ID is safer
        return logs.filter(l => l.routineId === routineId).length;
    }, [logs, routineId]);

    if (completionCount === 0 && minimal) return null;

    if (minimal) {
        return (
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                <Trophy className="h-3 w-3" />
                <span>{completionCount} veces completada</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Trophy className="h-6 w-6" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600/70">Historial</p>
                <p className="font-bold text-zinc-900">
                    Has completado esta rutina <span className="text-amber-600 text-lg">{completionCount}</span> veces
                </p>
            </div>
        </div>
    );
}
