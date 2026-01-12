"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash2, ArrowLeft } from "lucide-react";
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
        <div className="space-y-6 pb-24">
            <header className="sticky top-0 z-20 -mx-4 -mt-6 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-4 backdrop-blur-sm sm:mx-0 sm:mt-0 sm:rounded-t-3xl">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-zinc-500">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-zinc-900">{state.dayTitle}</h1>
                        <p className="text-xs text-zinc-500">{state.exercises.length} Ejercicios</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <WorkoutTimer />
                    <button
                        onClick={handleFinish}
                        className="rounded-full bg-[#0a2e5c] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0a2e5c]/90"
                    >
                        Terminar
                    </button>
                </div>
            </header>

            <div className="space-y-6 px-1">
                {state.exercises.map((exercise) => (
                    <div
                        key={exercise.id}
                        className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm"
                    >
                        <div className="border-b border-zinc-100 bg-zinc-50/50 px-5 py-3">
                            <h3 className="font-semibold text-[#0a2e5c]">{exercise.name}</h3>
                            <p className="text-xs text-[#51607c]">{exercise.sets.length} series est. • {exercise.rest} descanso</p>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 pb-2 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
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
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50"
                            >
                                <Plus className="h-3.5 w-3.5" /> Anadir serie
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
    setIndex
}: {
    set: any,
    exerciseId: string,
    setId: string,
    setIndex: number
}) {
    const store = useWorkoutStore();

    return (
        <div className={clsx(
            "grid grid-cols-[1fr_1fr_1fr_32px] items-center gap-2 rounded-xl border p-1 transition-colors",
            set.completed
                ? "border-emerald-200 bg-emerald-50/30"
                : "border-transparent bg-zinc-50"
        )}>
            <input
                type="number"
                placeholder="-"
                className="w-full bg-transparent text-center text-sm font-semibold text-zinc-900 placeholder-zinc-300 outline-none"
                value={set.weight}
                onChange={(e) => store.updateSet(exerciseId, setId, { weight: e.target.value })}
            />
            <input
                type="number"
                placeholder="-"
                className="w-full bg-transparent text-center text-sm font-semibold text-zinc-900 placeholder-zinc-300 outline-none"
                value={set.reps}
                onChange={(e) => store.updateSet(exerciseId, setId, { reps: e.target.value })}
            />
            <input
                type="number"
                placeholder="-"
                className="w-full bg-transparent text-center text-sm font-semibold text-zinc-900 placeholder-zinc-300 outline-none"
                value={set.rir}
                onChange={(e) => store.updateSet(exerciseId, setId, { rir: e.target.value })}
            />

            <button
                onClick={() => store.toggleSetComplete(exerciseId, setId)}
                className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                    set.completed
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-zinc-200 text-zinc-400 hover:bg-zinc-300"
                )}
            >
                <Check className="h-4 w-4" />
            </button>
        </div>
    )
}
