
"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import { useCol } from "@/lib/firestore/hooks";
import {
  defaultRoutines,
  mergeRoutines,
  templateToRoutineDefinition,
  buildExerciseIndex,
  type RoutineTemplateDoc,
} from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { type RoutineExercise } from "@/lib/types";
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
import ExerciseHistory from "@/components/exercise/exercise-history";
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

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams<{ exerciseId: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { db } = useFirebase();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const fromCreator = searchParams.get("from") === "creator";

  const [isSaving, setIsSaving] = useState(false);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

  const { data: routineTemplates } = useCol<RoutineTemplateDoc>(templatesPath, { by: "title", dir: "asc" });
  const { data: exerciseLogs } = useExerciseLogs(user?.uid);

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(templateToRoutineDefinition),
    [routineTemplates],
  );

  const routines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const exerciseEntry = useMemo(
    () => (fromCreator ? null : buildExerciseIndex(routines).get(params.exerciseId)),
    [routines, params.exerciseId, fromCreator],
  );

  const contextlessExercise = useMemo(() => {
    if (!fromCreator) return null;
    const baseExercise = defaultExercises.find((ex) => ex.id === params.exerciseId);
    if (!baseExercise) return null;

    return {
      ...baseExercise,
      sets: 3,
      repRange: "8-12",
      rest: "60s",
      tip: "",
    };
  }, [params.exerciseId, fromCreator]);

  const exercise = exerciseEntry?.exercise ?? contextlessExercise;
  const routine = exerciseEntry?.routine;

  const history = useMemo(() => {
    if (!exercise) return [] as ExerciseLog[];
    return (exerciseLogs ?? []).filter((log) => log.exerciseId === exercise.id);
  }, [exerciseLogs, exercise]);

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

    const todaysLog = history.find(log => isToday(log.date));
    if (todaysLog) {
      setActiveLogId(todaysLog.id);
      setSession({
        sessionDate: new Date(todaysLog.date).toISOString().slice(0, 16),
        perceivedEffort: todaysLog.perceivedEffort || "",
        notes: todaysLog.notes || "",
        mediaImage: todaysLog.mediaImage || exercise.image || "",
        mediaVideo: todaysLog.mediaVideo || exercise.video || "",
        sets: todaysLog.sets.length > 0 ? todaysLog.sets.map(logSetToSessionSet) : defaultSets,
      });
    }
  }, [history, exercise, defaultSets, fromCreator]);

  const backHref = useMemo(() => {
    const routineId = searchParams.get("routineId");
    const dayId = searchParams.get("dayId");
    if (routineId && dayId) {
      return `/routines/${routineId}/${dayId}`;
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
      return null; // No renderizar el botón si viene del creador de rutinas
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

      <ExerciseHeader exercise={exercise as RoutineExercise} routine={routine} />

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
          <ExerciseHistory history={history} />
        </>
      )}
    </div>
  );
}
