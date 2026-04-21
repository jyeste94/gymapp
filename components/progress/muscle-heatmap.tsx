"use client";

import { useMemo } from "react";
import Model from "react-body-highlighter";
import type { RoutineLog } from "@/lib/types";
import type { ExerciseLog } from "@/lib/firestore/exercise-logs";
import { calculateMuscleDistribution } from "@/lib/stats-helpers";

type Props = {
  logs: (RoutineLog | ExerciseLog)[];
};

const MUSCLE_MAPPING: Record<string, string[]> = {
  Pecho: ["chest"],
  Espalda: ["trapezius", "upper-back", "lower-back"],
  Hombro: ["front-deltoids", "back-deltoids"],
  Biceps: ["biceps"],
  Triceps: ["triceps"],
  Cuadriceps: ["quadriceps"],
  Isquios: ["hamstring"],
  Gluteos: ["gluteal"],
  Gemelos: ["calves"],
  Core: ["abs", "obliques"],
};

const HIGHLIGHT_COLORS = ["#d2e8ff", "#6aa9ff", "#0071e3"];

const getFrequency = (sets: number) => {
  if (sets < 5) return 1;
  if (sets < 12) return 2;
  return 3;
};

export default function MuscleHeatmap({ logs }: Props) {
  const muscleCounts = useMemo(() => calculateMuscleDistribution(logs), [logs]);

  const data = useMemo(() => {
    const result: { name: string; muscles: string[]; frequency: number }[] = [];

    Object.entries(muscleCounts).forEach(([muscleName, sets]) => {
      if (sets === 0) return;

      const slugs = MUSCLE_MAPPING[muscleName];
      if (slugs) {
        result.push({
          name: muscleName,
          muscles: slugs,
          frequency: getFrequency(sets),
        });
      }
    });

    return result;
  }, [muscleCounts]);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="flex flex-row items-start justify-center gap-8 sm:gap-12">
        <div className="flex flex-col items-center gap-3">
          <p className="apple-kicker">Frente</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Model data={data as any} type="anterior" style={{ width: "8rem", height: "14rem" }} highlightedColors={HIGHLIGHT_COLORS} />
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="apple-kicker">Espalda</p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Model data={data as any} type="posterior" style={{ width: "8rem", height: "14rem" }} highlightedColors={HIGHLIGHT_COLORS} />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 rounded-xl bg-white px-4 py-3 dark:bg-apple-surface-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#0071e3]" />
          <span className="sf-text-nano text-apple-near-black/62 dark:text-white/62">Alta</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#6aa9ff]" />
          <span className="sf-text-nano text-apple-near-black/62 dark:text-white/62">Media</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#d2e8ff]" />
          <span className="sf-text-nano text-apple-near-black/62 dark:text-white/62">Baja</span>
        </div>
      </div>
    </div>
  );
}
