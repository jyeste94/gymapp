"use client";
import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkoutTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const format = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-apple-near-black/12 bg-white px-3 py-1.5 shadow-sm dark:border-white/14 dark:bg-apple-surface-1">
      <span className="w-12 text-center font-mono text-sm font-semibold text-apple-near-black dark:text-white">{format(seconds)}</span>
      <div className="flex gap-1">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={cn(
            "rounded-full p-1 transition",
            isRunning
              ? "text-[#ff9500] hover:bg-[#ff9500]/14"
              : "text-apple-blue hover:bg-apple-blue/14"
          )}
        >
          {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => {
            setIsRunning(false);
            setSeconds(0);
          }}
          className="rounded-full p-1 text-apple-near-black/45 transition hover:bg-apple-near-black/8 hover:text-apple-near-black dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}