"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, ArrowLeft } from "lucide-react";
import { useWorkoutStore } from "@/lib/stores/workout-session";
import { WorkoutTimer } from "@/components/workout/workout-timer";
import clsx from "clsx";

/* 
 * Active Workout Page
 * - Displays list of exercises
 * - Allows logging sets
 * - Handles finishing the workout
 */
export default function ActiveWorkoutPage() {
    const router = useRouter();
    const state = useWorkoutStore();

    // Hydration check
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    if (!state.startTime) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <h2 className="text-lg font-semibold text-zinc-900">No hay entrenamiento activo</h2>
                <button
                    onClick={() => router.push("/routines")}
                    className="mt-4 rounded-2xl bg-[#0a2e5c] px-6 py-2 text-sm font-semibold text-white"
                >
                    Ir a rutinas
                </button>
            </div>
        );
    }

    const handleFinish = () => {
        // Navigate to summary which will handle the saving logic
        router.push("/workout/finish");
    };

    return (
        <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
            <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
                <header className="sticky top-0 z-20 -mx-4 -mt-6 flex items-center justify-between border-b border-brand-border bg-brand-surface/95 px-6 py-4 backdrop-blur-sm sm:mx-0 sm:mt-0 sm:rounded-t-3xl">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-brand-text-muted hover:text-brand-text-main">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-sm font-bold text-brand-text-main">{state.dayTitle}</h1>
                            <p className="text-xs text-brand-text-muted">{state.exercises.length} Ejercicios</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <WorkoutTimer />
                        <button
                            onClick={handleFinish}
                            className="rounded-full bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-primary/90"
                        >
                            Terminar
                        </button>
                    </div>
                </header>

                <div className="space-y-6 px-1">
                    {state.exercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className="overflow-hidden rounded-3xl border border-brand-border bg-brand-surface shadow-sm"
                        >
                            <div className="border-b border-brand-border bg-brand-dark/50 px-5 py-3">
                                <h3 className="font-semibold text-brand-text-main">{exercise.name}</h3>
                                <p className="text-xs text-brand-text-muted">{exercise.sets.length} series est. | {exercise.rest} descanso</p>
                            </div>

                            <div className="p-4">
                                <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 pb-2 text-center text-[10px] font-bold uppercase tracking-wider text-brand-text-muted">
                                    <div>KG</div>
                                    <div>Reps</div>
                                    <div>RIR</div>
                                    <div></div>
                                </div>

                                <div className="space-y-2">
                                    {exercise.sets.map((set, index) => (
                                        <SetRow
                                            key={set.id}
                                            setIndex={index}
                                            setId={set.id}
                                            exerciseId={exercise.id}
                                            set={set}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => state.addSet(exercise.id)}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border py-2 text-xs font-medium text-brand-text-muted hover:bg-brand-dark"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Anadir serie
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SetRow({
    set,
    exerciseId,
    setId,
}: {
    set: import("@/lib/stores/workout-session").WorkoutSet,
    exerciseId: string,
    setId: string,
    setIndex: number
}) {
    const store = useWorkoutStore();

    return (
        <div className={clsx(
            "grid grid-cols-[1fr_1fr_1fr_40px] items-center gap-2 rounded-xl border p-1.5 transition-colors",
            set.completed
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-brand-border bg-brand-dark"
        )}>
            <input
                type="text"
                placeholder="-"
                className="w-full rounded-lg bg-transparent py-1 text-center text-sm font-semibold text-brand-text-main placeholder-brand-text-muted/50 outline-none transition focus:bg-brand-surface focus:ring-2 focus:ring-brand-primary"
                value={set.weight}
                onChange={(e) => store.updateSet(exerciseId, setId, { weight: e.target.value })}
            />
            <input
                type="number"
                placeholder="-"
                className="w-full rounded-lg bg-transparent py-1 text-center text-base font-semibold text-brand-text-main placeholder-brand-text-muted/50 outline-none transition focus:bg-brand-surface focus:ring-2 focus:ring-brand-primary"
                value={set.reps}
                onChange={(e) => store.updateSet(exerciseId, setId, { reps: e.target.value })}
            />
            <input
                type="number"
                placeholder="-"
                className="w-full rounded-lg bg-transparent py-1 text-center text-base font-semibold text-brand-text-main placeholder-brand-text-muted/50 outline-none transition focus:bg-brand-surface focus:ring-2 focus:ring-brand-primary"
                value={set.rir}
                onChange={(e) => store.updateSet(exerciseId, setId, { rir: e.target.value })}
            />

            <button
                onClick={() => store.toggleSetComplete(exerciseId, setId)}
                className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95",
                    set.completed
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
                        : "bg-brand-surface text-brand-text-muted hover:bg-brand-primary/20 hover:text-brand-primary border border-brand-border"
                )}
            >
                <Check className="h-5 w-5" />
            </button>
        </div>
    )
}

