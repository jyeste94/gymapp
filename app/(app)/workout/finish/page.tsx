"use client";

import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import { addWorkoutLog } from "@/lib/firestore/workout-logs";
import { useWorkoutStore } from "@/lib/stores/workout-session";
import { getExercisesToSave } from "@/lib/workout-helpers";

export default function WorkoutFinishPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { db } = useFirebase();
  const state = useWorkoutStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state.exercises.length > 0 && !saved) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0071e3", "#34C759", "#FF3B30"],
      });
    }
  }, [saved, state.exercises.length]);

  const stats = {
    exercises: state.exercises.length,
    sets: state.exercises.reduce((acc, ex) => acc + ex.sets.filter((set) => set.completed).length, 0),
    volume: state.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((set) => set.completed).reduce((setAcc, set) => setAcc + (Number(set.weight) * Number(set.reps) || 0), 0),
      0,
    ),
  };

  const handleSave = async () => {
    if (!user || !db || saving) return;

    setSaving(true);
    try {
      await addWorkoutLog(db, user.uid, {
        date: new Date().toISOString(),
        routineId: state.routineId || undefined,
        routineName: state.routineTitle || undefined,
        dayId: state.dayId || undefined,
        dayName: state.dayTitle || undefined,
        entries: getExercisesToSave(state.exercises),
      });

      setSaved(true);
      state.finishWorkout();

      setTimeout(() => {
        router.push("/routines");
      }, 2000);
    } catch (error) {
      console.error("Failed to save workout", error);
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="apple-page-shell max-w-lg pt-12">
        <div className="apple-panel flex flex-col items-center justify-center p-12 text-center">
          <CheckCircle2 className="mb-6 h-20 w-20 text-[#34C759]" />
          <h1 className="mb-2 sf-display-card-title text-apple-near-black dark:text-white">Entrenamiento guardado</h1>
          <p className="sf-text-body text-apple-near-black/60 dark:text-white/60">Redirigiendo a tus rutinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-page-shell max-w-xl space-y-8">
      <div className="mx-auto w-full space-y-8 py-10">
        <div className="mb-10 text-center">
          <h1 className="mb-3 sf-display-hero text-apple-near-black dark:text-white">Gran trabajo</h1>
          <p className="sf-text-subnav text-apple-near-black/60 dark:text-white/60">
            Has completado tu sesion de <span className="font-semibold text-apple-near-black dark:text-white">{state.dayTitle}</span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Ejercicios" value={stats.exercises} />
          <StatBox label="Series validas" value={stats.sets} />
          <StatBox label="Volumen total" value={`${(stats.volume / 1000).toFixed(1)}k kg`} colSpan />
        </div>

        <div className="flex flex-col gap-4 pt-10">
          <button
            onClick={handleSave}
            disabled={saving || !db}
            className="btn-apple-primary w-full justify-center rounded-2xl px-6 py-4 sf-text-body-strong shadow-md transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar entrenamiento"}
          </button>
          <button
            onClick={() => router.back()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-apple-gray px-6 py-4 sf-text-body-strong text-apple-near-black/80 transition-colors hover:bg-apple-near-black/5 active:scale-[0.98] dark:bg-apple-surface-2 dark:text-white/80 dark:hover:bg-white/5"
          >
            <RotateCcw className="h-5 w-5" /> Volver a editar
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, colSpan }: { label: string; value: string | number; colSpan?: boolean }) {
  return (
    <div className={`apple-panel p-6 text-center ${colSpan ? "col-span-2" : ""}`}>
      <p className="mb-2 sf-text-nano uppercase tracking-widest text-apple-blue/80">{label}</p>
      <p className="text-4xl font-semibold tracking-tight text-apple-near-black dark:text-white">{value}</p>
    </div>
  );
}
