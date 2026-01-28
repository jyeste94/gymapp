"use client";
import { useMemo, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import { useCol } from "@/lib/firestore/hooks";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines, buildExerciseIndex } from "@/lib/routine-helpers";
import type { RoutineExercise, RoutineTemplate } from "@/lib/types";
import { useWorkoutLogs } from "@/lib/firestore/workout-logs";
import {
  useExerciseLogs,
  saveExerciseLog,
  updateExerciseLog,
  type ExerciseLog,
  type ExerciseLogSet,
} from "@/lib/firestore/exercise-logs";
import MediaShowcase from "@/components/ui/media-showcase";
import ExerciseHeader from "@/components/exercise/exercise-header";
import TechniqueGuide from "@/components/exercise/technique-guide";
import SessionForm from "@/components/exercise/session-form";
import type { SessionState, SessionSet } from "@/components/exercise/types";
import toast from 'react-hot-toast';

const createSets = (count: number): SessionSet[] =>
  Array.from({ length: count }, () => ({ weight: "", reps: "", rir: "", completed: false }));

const isToday = (isoDate: string) => {
  const today = new Date();
  const logDate = new Date(isoDate);
  return (
    today.getFullYear() === logDate.getFullYear() &&
    today.getMonth() === logDate.getMonth() &&
    today.getDate() === logDate.getDate()
  );
};

const logSetToSessionSet = (logSet: ExerciseLogSet): SessionSet => ({
  weight: logSet.weight || "",
  reps: logSet.reps || "",
  rir: logSet.rir || "",
  completed: false,
});

function ExerciseDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const exerciseId = searchParams.get("id");
  const { user } = useAuth();
  const { db } = useFirebase();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const fromCreator = searchParams.get("from") === "creator";

  const [isSaving, setIsSaving] = useState(false);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

  const { data: routineTemplates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });
  const { data: exerciseLogs } = useExerciseLogs(user?.uid);
  const { data: workoutLogs } = useWorkoutLogs(user?.uid);

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const allRoutines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const exerciseIndex = useMemo(() => buildExerciseIndex(allRoutines), [allRoutines]);

  const exerciseEntry = useMemo(
    () => (fromCreator ? null : exerciseIndex.get(exerciseId ?? "")),
    [exerciseIndex, exerciseId, fromCreator],
  );

  const contextlessExercise = useMemo(() => {
    if (!fromCreator || !exerciseId) return null;
    const baseExercise = defaultExercises.find((ex) => ex.id === exerciseId);
    if (!baseExercise) return null;

    return {
      ...baseExercise,
      sets: 3,
      repRange: "8-12",
      rest: "60s",
      tip: "",
    } as RoutineExercise;
  }, [exerciseId, fromCreator]);

  const exercise = exerciseEntry?.exercise ?? contextlessExercise;
  const routine = exerciseEntry?.routine;

  const history = useMemo(() => {
    if (!exercise) return [] as ExerciseLog[];

    // 1. Get direct exercise logs
    const directLogs = (exerciseLogs ?? []).filter((log) => log.exerciseId === exercise.id);

    // 2. Extract logs from complete workout sessions (legacy/fallback)
    const extractedLogs: ExerciseLog[] = [];
    if (workoutLogs) {
      workoutLogs.forEach(wLog => {
        // Find entry for this exercise in the workout log
        const entry = wLog.entries.find(e => e.exerciseId === exercise.id);
        if (entry && entry.sets && entry.sets.length > 0) {
          // Create a transient ExerciseLog object
          extractedLogs.push({
            id: `extracted-${wLog.id}-${exercise.id}`, // Temporary ID
            exerciseId: exercise.id,
            exerciseName: entry.exerciseName,
            routineId: wLog.routineId,
            routineName: wLog.routineName,
            dayId: wLog.dayId,
            dayName: wLog.dayName,
            date: wLog.date,
            perceivedEffort: wLog.effort?.toString() ?? null,
            notes: entry.notes ?? entry.comment ?? null,
            mediaImage: null,
            mediaVideo: null,
            sets: entry.sets.map(s => ({
              weight: s.weight?.toString() ?? "",
              reps: s.reps?.toString() ?? "",
              rir: s.rir?.toString() ?? "",
              completed: true // Assume completed if in log
            }))
          });
        }
      });
    }

    // 3. Merge and Deduplicate (by date, roughly)
    // If we have a direct log and an extracted log for the same time, prefer direct log.
    const combined = [...directLogs];
    extractedLogs.forEach(exLog => {
      // Check if we already have a log near this date (within 1 minute)
      const exists = combined.some(existing =>
        Math.abs(new Date(existing.date).getTime() - new Date(exLog.date).getTime()) < 60000
      );
      if (!exists) {
        combined.push(exLog);
      }
    });

    // 4. Sort descending
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [exerciseLogs, workoutLogs, exercise]);

  const defaultSets = useMemo(
    () => (exercise ? createSets(exercise.sets) : []),
    [exercise]
  );

  const [session, setSession] = useState<SessionState>({
    sessionDate: new Date().toISOString().slice(0, 16),
    perceivedEffort: "",
    notes: "",
    mediaImage: exercise?.image ?? "",
    mediaVideo: exercise?.video ?? "",
    sets: defaultSets,
  });

  useEffect(() => {
    if (fromCreator || !exercise) return;

    // Check if we already have a log for TODAY
    const todaysLog = history.find(log => isToday(log.date));

    if (todaysLog) {
      // If we have a log for today, we are EDITING it.
      setActiveLogId(todaysLog.id);
      setSession({
        sessionDate: new Date(todaysLog.date).toISOString().slice(0, 16),
        perceivedEffort: todaysLog.perceivedEffort || "",
        notes: todaysLog.notes || "",
        mediaImage: todaysLog.mediaImage || exercise.image || "",
        mediaVideo: todaysLog.mediaVideo || exercise.video || "",
        sets: todaysLog.sets.length > 0 ? todaysLog.sets.map(logSetToSessionSet) : defaultSets,
      });
    } else if (history.length > 0) {
      // If NO log for today, but we have history, PRE-FILL from the last session.
      // We do NOT set activeLogId, because we want to create a NEW log for today.
      const lastLog = history[0]; // history is sorted desc based on useExerciseLogs

      const prefillSets = lastLog.sets.map(s => ({
        weight: s.weight || "",
        reps: "", // Don't pre-fill reps for new sessions, let them log actuals
        rir: "",
        completed: false
      }));

      // Ensure we match the target set count (if template has 3 sets but history had 4, or vice versa)
      const mergedSets = defaultSets.map((defSet, i) => {
        return prefillSets[i] ? { ...prefillSets[i], completed: false } : defSet;
      });

      setSession(prev => ({
        ...prev,
        sets: mergedSets
      }));
    }
  }, [history, exercise, defaultSets, fromCreator]);

  const backHref = useMemo(() => {
    const routineId = searchParams.get("routineId");
    const dayId = searchParams.get("dayId");
    if (routineId && dayId) {
      return `/routines/day?routineId=${routineId}&dayId=${dayId}`;
    }
    return null;
  }, [searchParams]);

  if (!exercise) {
    return (
      <div className="space-y-4 rounded-2xl border border-[rgba(10,46,92,0.18)] bg-white/80 p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Ejercicio no encontrado</h1>
        <p className="text-sm text-[#4b5a72]">
          Revisa tus rutinas desde la seccion principal para seleccionar un ejercicio valido.
        </p>
        <Link href="/routines" className="inline-flex items-center gap-2 text-xs font-semibold text-[#4b5a72]">
          Volver a rutinas
        </Link>
      </div>
    );
  }

  const handleSetField = (index: number, field: "weight" | "reps" | "rir") => (value: string) => {
    setSession((prev) => {
      const nextSets = [...prev.sets];
      nextSets[index] = { ...nextSets[index], [field]: value };
      return { ...prev, sets: nextSets };
    });
  };

  const toggleSetCompleted = (index: number) => {
    setSession((prev) => {
      const nextSets = [...prev.sets];
      nextSets[index] = { ...nextSets[index], completed: !nextSets[index].completed };
      return { ...prev, sets: nextSets };
    });
  };

  const addExtraSet = () => {
    setSession((prev) => ({ ...prev, sets: [...prev.sets, { weight: "", reps: "", rir: "", completed: false }] }));
  };

  const removeLastSet = () => {
    setSession((prev) => ({ ...prev, sets: prev.sets.length > 1 ? prev.sets.slice(0, -1) : prev.sets }));
  };

  const handleSave = async () => {
    if (!user || !db || !exerciseEntry) return;
    setIsSaving(true);

    const hasSetData = session.sets.some(set => Boolean(set.weight || set.reps || set.rir));
    if (!hasSetData && !session.notes.trim()) {
      toast.error("No hay datos para guardar.");
      setIsSaving(false);
      return;
    }

    const setsToSave = session.sets.map(set => ({
      weight: set.weight,
      reps: set.reps,
      rir: set.rir,
    }));

    const logData = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      routineId: exerciseEntry.routine.id,
      routineName: exerciseEntry.routine.title,
      dayId: exerciseEntry.day.id,
      dayName: exerciseEntry.day.title,
      date: new Date(session.sessionDate || new Date().toISOString()).toISOString(),
      perceivedEffort: session.perceivedEffort || null,
      notes: session.notes.trim() || null,
      mediaImage: session.mediaImage.trim() || null,
      mediaVideo: session.mediaVideo.trim() || null,
      sets: setsToSave,
    };

    try {
      if (activeLogId) {
        await updateExerciseLog(db, user.uid, activeLogId, logData);
        toast.success("Registro actualizado con éxito!");
      } else {
        const newLogId = await saveExerciseLog(db, user.uid, logData);
        setActiveLogId(newLogId);
        toast.success("Registro guardado con éxito!");
      }
    } catch (e) {
      toast.error("Error al guardar el registro.");
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const renderBackButton = () => {
    if (backHref) {
      return (
        <Link href={backHref} className="inline-flex items-center gap-2 text-xs font-semibold text-[#4b5a72]">
          {"<- Volver"}
        </Link>
      );
    }
    if (fromCreator) {
      return null;
    }
    return (
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-xs font-semibold text-[#4b5a72]">
        {"<- Volver"}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {renderBackButton()}

      {routine && <ExerciseHeader exercise={exercise as RoutineExercise} routine={routine} />}

      <MediaShowcase image={session.mediaImage || exercise.image} video={session.mediaVideo || exercise.video} />

      <TechniqueGuide exercise={exercise as RoutineExercise} />

      {!fromCreator && (
        <>
          <SessionForm
            session={session}
            setSession={setSession}
            handleSave={handleSave}
            isSaving={isSaving}
            userId={user?.uid}
            addExtraSet={addExtraSet}
            removeLastSet={removeLastSet}
            toggleSetCompleted={toggleSetCompleted}
            handleSetField={handleSetField}
          />
          {/* History removed per user request to avoid clutter */}
          {/* <ExerciseHistory history={history} /> */}
        </>
      )}
    </div>
  );
}

export default function ExerciseDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm text-[#51607c]">Cargando ejercicio...</div>}>
      <ExerciseDetailContent />
    </Suspense>
  );
}
