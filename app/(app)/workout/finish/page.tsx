
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutStore } from "@/lib/stores/workout-session";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { addWorkoutLog } from "@/lib/firestore/workout-logs";
import { useFirebase } from "@/lib/firebase/client-context";
import { CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
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
            });
        }
    }, [state.exercises.length, saved]);

    const stats = {
        exercises: state.exercises.length,
        sets: state.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0),
        volume: state.exercises.reduce((acc, ex) => {
            return acc + ex.sets.filter(s => s.completed).reduce((sAcc, set) => sAcc + (Number(set.weight) * Number(set.reps) || 0), 0)
        }, 0)
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
                entries: getExercisesToSave(state.exercises)
            });

            setSaved(true);
            state.finishWorkout();

            // Wait a bit before redirecting for better UX
            setTimeout(() => {
                router.push("/routines");
            }, 2000);

        } catch (err) {
            console.error("Failed to save workout", err);
            setSaving(false);
        }
    };

    if (saved) {
        return (
            <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-auto md:mt-0 md:min-h-screen md:w-full md:max-w-lg md:rounded-3xl md:shadow-2xl">
                <div className="flex-1 space-y-4 px-5 pb-24 h-[100dvh] overflow-y-auto flex flex-col items-center justify-center text-center">
                    <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                    <h1 className="text-2xl font-bold text-brand-text-main">¡Entrenamiento Guardado!</h1>
                    <p className="text-brand-text-muted">Redirigiendo a tus rutinas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
            <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
                <div className="mx-auto w-full max-w-md space-y-8 py-10">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-brand-text-main">¡Gran trabajo!</h1>
                        <p className="mt-2 text-brand-text-muted">Has completado tu sesión de {state.dayTitle}.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <StatBox label="Ejercicios" value={stats.exercises} />
                        <StatBox label="Series Valid" value={stats.sets} />
                        <StatBox label="Volumen Total" value={`${(stats.volume / 1000).toFixed(1)}k kg`} colSpan />
                    </div>

                    <div className="flex flex-col gap-3 pt-8">
                        <button
                            onClick={handleSave}
                            disabled={saving || !db}
                            className="group relative flex w-full items-center justify-center justify-items-center gap-2 rounded-2xl bg-brand-primary px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-brand-primary/20 hover:ring-2 hover:ring-brand-primary/50 hover:ring-offset-2 hover:ring-offset-brand-dark disabled:opacity-50"
                        >
                            {saving ? "Guardando..." : "Guardar Entrenamiento"}
                        </button>
                        <button
                            onClick={() => router.back()}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-border px-6 py-4 text-base font-semibold text-brand-text-muted transition hover:bg-brand-surface"
                        >
                            <RotateCcw className="h-4 w-4" /> Volver a editar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, colSpan }: { label: string, value: string | number, colSpan?: boolean }) {
    return (
        <div className={`rounded-3xl border border-brand-border bg-brand-surface p-6 text-center ${colSpan ? 'col-span-2' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary/80">{label}</p>
            <p className="mt-2 text-3xl font-bold text-brand-text-main">{value}</p>
        </div>
    );
}

