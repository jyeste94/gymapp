
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkoutStore } from "@/lib/stores/workout-session";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { addRoutineLog } from "@/lib/firestore/routine-logs";
import { useFirebase } from "@/lib/firebase/client-context";
import { CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";

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
            await addRoutineLog(db, user.uid, {
                date: new Date().toISOString(),
                routineId: state.routineId || undefined,
                routineName: state.routineTitle || undefined,
                dayId: state.dayId || undefined,
                dayName: state.dayTitle || undefined,
                entries: state.exercises.map(ex => ({
                    exerciseId: ex.id,
                    exerciseName: ex.name,
                    sets: ex.sets.filter(s => s.completed).map(s => ({
                        weight: Number(s.weight) || 0,
                        reps: Number(s.reps) || 0,
                        rir: Number(s.rir) || 0,
                    }))
                })).filter(e => e.sets.length > 0)
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
            <div className="flex h-screen flex-col items-center justify-center space-y-4 p-6 text-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                <h1 className="text-2xl font-bold text-[#0a2e5c]">¡Entrenamiento Guardado!</h1>
                <p className="text-[#51607c]">Redirigiendo a tus rutinas...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-white p-6">
            <div className="mx-auto w-full max-w-md space-y-8 py-10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-[#0a2e5c]">¡Gran trabajo!</h1>
                    <p className="mt-2 text-[#51607c]">Has completado tu sesión de {state.dayTitle}.</p>
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
                        className="group relative flex w-full items-center justify-center justify-items-center gap-2 rounded-2xl bg-[#0a2e5c] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl disabled:opacity-70"
                    >
                        {saving ? "Guardando..." : "Guardar Entrenamiento"}
                    </button>
                    <button
                        onClick={() => router.back()}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 px-6 py-4 text-base font-semibold text-[#51607c] transition hover:bg-zinc-50"
                    >
                        <RotateCcw className="h-4 w-4" /> Volver a editar
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, colSpan }: { label: string, value: string | number, colSpan?: boolean }) {
    return (
        <div className={`rounded-3xl border border-zinc-100 bg-zinc-50/50 p-6 text-center ${colSpan ? 'col-span-2' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-[#93a2b7]">{label}</p>
            <p className="mt-2 text-3xl font-bold text-[#0a2e5c]">{value}</p>
        </div>
    );
}
