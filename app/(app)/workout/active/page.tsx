"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Plus } from "lucide-react";
import { WorkoutTimer } from "@/components/workout/workout-timer";
import { useWorkoutStore } from "@/lib/stores/workout-session";

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const state = useWorkoutStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (!state.startTime) {
    return (
      <div className="apple-page-shell max-w-3xl">
        <div className="apple-panel mt-12 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="sf-text-body-strong text-apple-near-black dark:text-white">No hay entrenamiento activo</h2>
          <button onClick={() => router.push("/routines")} className="btn-apple-primary mt-6">
            Ir a rutinas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-page-shell max-w-3xl space-y-6">
      <header className="sticky top-0 z-20 mb-2 flex items-center justify-between rounded-3xl border border-apple-near-black/5 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-apple-surface-1/90">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-apple-blue transition-opacity hover:opacity-80">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="line-clamp-1 max-w-[150px] sf-text-body-strong text-apple-near-black dark:text-white sm:max-w-xs">{state.dayTitle}</h1>
            <p className="sf-text-nano text-apple-near-black/50 dark:text-white/50">{state.exercises.length} ejercicios</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <WorkoutTimer />
          <button onClick={() => router.push("/workout/finish")} className="rounded-full bg-apple-blue px-4 py-[6px] sf-text-caption font-semibold text-white shadow-sm transition hover:bg-opacity-90">
            Terminar
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {state.exercises.map((exercise) => (
          <div key={exercise.id} className="apple-panel overflow-hidden rounded-3xl border-none p-0">
            <div className="border-b border-apple-near-black/5 bg-apple-gray px-5 py-4 dark:border-white/5 dark:bg-apple-surface-2">
              <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">{exercise.name}</h3>
              <p className="mt-1 sf-text-caption text-apple-near-black/50 dark:text-white/50">
                {exercise.sets.length} series est. - {exercise.rest} descanso
              </p>
            </div>

            <div className="p-2 sm:p-5">
              <div className="mb-1 grid grid-cols-[1fr_1fr_1fr_48px] gap-2 px-1 pb-2 text-center sf-text-nano uppercase tracking-widest text-apple-near-black/40 dark:text-white/40">
                <div>KG</div>
                <div>Reps</div>
                <div>RIR</div>
                <div />
              </div>

              <div className="space-y-2">
                {exercise.sets.map((set, index) => (
                  <SetRow key={set.id} setId={set.id} setIndex={index} exerciseId={exercise.id} set={set} />
                ))}
              </div>

              <button
                onClick={() => state.addSet(exercise.id)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-apple-blue/30 py-3 sf-text-body font-medium text-apple-blue transition-colors hover:bg-apple-blue/10 active:bg-apple-blue/20"
              >
                <Plus className="h-4 w-4" /> Anadir serie
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetRow({
  set,
  exerciseId,
  setId,
}: {
  set: import("@/lib/stores/workout-session").WorkoutSet;
  exerciseId: string;
  setId: string;
  setIndex: number;
}) {
  const store = useWorkoutStore();

  return (
    <div
      className={clsx(
        "grid grid-cols-[1fr_1fr_1fr_48px] items-center gap-2 rounded-2xl p-1.5 transition-colors sm:px-2",
        set.completed
          ? "bg-[#34C759]/10"
          : "bg-apple-gray shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2",
      )}
    >
      <input
        type="text"
        placeholder="-"
        className="w-full rounded-xl bg-transparent py-2.5 text-center sf-text-body font-semibold text-apple-near-black shadow-sm outline-none transition placeholder:text-apple-near-black/20 focus:bg-white focus:ring-2 focus:ring-apple-blue dark:text-white dark:placeholder:text-white/20 dark:focus:bg-apple-surface-1"
        value={set.weight}
        onChange={(event) => store.updateSet(exerciseId, setId, { weight: event.target.value })}
      />
      <input
        type="number"
        placeholder="-"
        className="w-full rounded-xl bg-transparent py-2.5 text-center sf-text-body font-semibold text-apple-near-black shadow-sm outline-none transition placeholder:text-apple-near-black/20 focus:bg-white focus:ring-2 focus:ring-apple-blue dark:text-white dark:placeholder:text-white/20 dark:focus:bg-apple-surface-1"
        value={set.reps}
        onChange={(event) => store.updateSet(exerciseId, setId, { reps: event.target.value })}
      />
      <input
        type="number"
        placeholder="-"
        className="w-full rounded-xl bg-transparent py-2.5 text-center sf-text-body font-semibold text-apple-near-black shadow-sm outline-none transition placeholder:text-apple-near-black/20 focus:bg-white focus:ring-2 focus:ring-apple-blue dark:text-white dark:placeholder:text-white/20 dark:focus:bg-apple-surface-1"
        value={set.rir}
        onChange={(event) => store.updateSet(exerciseId, setId, { rir: event.target.value })}
      />

      <button
        onClick={() => store.toggleSetComplete(exerciseId, setId)}
        className={clsx(
          "mx-auto flex h-[42px] w-[42px] items-center justify-center rounded-xl shadow-sm transition-all active:scale-95",
          set.completed
            ? "bg-[#34C759] text-white"
            : "border border-apple-near-black/5 bg-white text-apple-near-black/40 hover:text-apple-blue dark:border-white/5 dark:bg-apple-surface-1 dark:text-white/40",
        )}
      >
        <Check className="h-5 w-5 stroke-[2.5]" />
      </button>
    </div>
  );
}
