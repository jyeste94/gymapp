"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { add } from "@/lib/firestore/crud";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import {
  defaultRoutines,
  mergeRoutines,
  templateToRoutineDefinition,
  buildExerciseIndex,
  type RoutineTemplateDoc,
} from "@/lib/data/routine-library";

type SessionSet = {
  weight: string;
  reps: string;
  rir: string;
  completed: boolean;
};

type SessionState = {
  sessionDate: string;
  perceivedEffort: string;
  notes: string;
  mediaImage: string;
  mediaVideo: string;
  sets: SessionSet[];
};

type ExerciseLogDoc = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  routineId?: string;
  routineName?: string;
  dayId?: string;
  dayName?: string;
  date: string;
  perceivedEffort?: string;
  notes?: string;
  mediaImage?: string;
  mediaVideo?: string;
  sets: Array<{
    weight?: string;
    reps?: string;
    rir?: string;
    completed?: boolean;
  }>;
};

const dateFormatter =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" })
    : null;

const formatDate = (iso?: string) => {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    return dateFormatter ? dateFormatter.format(date) : iso;
  } catch {
    return null;
  }
};

const createSets = (count: number): SessionSet[] =>
  Array.from({ length: count }, () => ({ weight: "", reps: "", rir: "", completed: false }));

export default function ExerciseDetailPage() {
  const params = useParams<{ exerciseId: string }>();
  const { user } = useAuth();
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;
  const logsPath = user?.uid ? `users/${user.uid}/exerciseLogs` : null;

  const { data: routineTemplates } = useCol<RoutineTemplateDoc>(templatesPath, { by: "title", dir: "asc" });
  const { data: exerciseLogs } = useCol<ExerciseLogDoc>(logsPath, { by: "date", dir: "desc" });

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(templateToRoutineDefinition),
    [routineTemplates],
  );

  const routines = useMemo(
    () => mergeRoutines(customRoutines, defaultRoutines),
    [customRoutines],
  );

  const exerciseEntry = useMemo(() => buildExerciseIndex(routines).get(params.exerciseId), [routines, params.exerciseId]);

  const defaultSets = exerciseEntry ? createSets(exerciseEntry.exercise.sets) : [];
  const [session, setSession] = useState<SessionState>({
    sessionDate: new Date().toISOString().slice(0, 16),
    perceivedEffort: "",
    notes: "",
    mediaImage: exerciseEntry?.exercise.image ?? "",
    mediaVideo: exerciseEntry?.exercise.video ?? "",
    sets: defaultSets,
  });

  const history = useMemo(() => {
    if (!exerciseEntry) return [] as ExerciseLogDoc[];
    return (exerciseLogs ?? []).filter((log) => log.exerciseId === exerciseEntry.exercise.id);
  }, [exerciseLogs, exerciseEntry]);

  if (!exerciseEntry) {
    return (
      <div className="space-y-4 rounded-2xl border border-[rgba(34,99,255,0.18)] bg-white/80 p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Ejercicio no encontrado</h1>
        <p className="text-sm text-zinc-600">
          Revisa tus rutinas desde la seccion principal para seleccionar un ejercicio valido.
        </p>
        <Link href="/routines" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600">
          Volver a rutinas
        </Link>
      </div>
    );
  }

  const { exercise, routine, day } = exerciseEntry;

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
    if (!user) return;
    const cleanedSets = session.sets.filter((set) =>
      Boolean(set.completed || set.weight || set.reps || set.rir)
    );

    if (!cleanedSets.length && !session.notes.trim()) return;

    await add(`users/${user.uid}/exerciseLogs`, {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      routineId: routine.id,
      routineName: routine.title,
      dayId: day.id,
      dayName: day.title,
      date: new Date(session.sessionDate || new Date().toISOString()).toISOString(),
      perceivedEffort: session.perceivedEffort || undefined,
      notes: session.notes.trim() || undefined,
      mediaImage: session.mediaImage.trim() || undefined,
      mediaVideo: session.mediaVideo.trim() || undefined,
      sets: cleanedSets,
    });

    setSession({
      sessionDate: new Date().toISOString().slice(0, 16),
      perceivedEffort: "",
      notes: "",
      mediaImage: exercise.image ?? "",
      mediaVideo: exercise.video ?? "",
      sets: createSets(exercise.sets),
    });
  };

  return (
    <div className="space-y-6">
      <Link href={`/routines/${routine.id}/${day.id}`} className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600">
        &lt;- Volver a {day.title}
      </Link>

      <header className="rounded-2xl border bg-white/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">{routine.title}</p>
            <h1 className="text-2xl font-semibold text-zinc-900">{exercise.name}</h1>
            <p className="mt-2 text-sm text-zinc-600">{exercise.description}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2 text-xs text-zinc-500">
            <Chip label={`${exercise.sets} series`} />
            <Chip label={`${exercise.repRange} reps`} />
            <Chip label={`Descanso ${exercise.rest}`} />
            {exercise.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </div>
        </div>
      </header>

      <MediaShowcase image={session.mediaImage || exercise.image} video={session.mediaVideo || exercise.video} />

      <section className="rounded-2xl border bg-white/70 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Tecnica recomendada</h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-600">
          {exercise.technique.map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-zinc-400" aria-hidden />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border bg-white/70 p-6 shadow-sm">
        <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Fecha y hora</label>
              <input
                type="datetime-local"
                value={session.sessionDate}
                onChange={(event) => setSession((prev) => ({ ...prev, sessionDate: event.target.value }))}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Esfuerzo percibido (RPE)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={session.perceivedEffort}
                onChange={(event) => setSession((prev) => ({ ...prev, perceivedEffort: event.target.value }))}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            {session.sets.map((set, index) => (
              <div key={index} className="rounded-2xl border border-[rgba(34,99,255,0.18)] bg-white/80 px-4 py-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Serie {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => toggleSetCompleted(index)}
                    className={clsx(
                      "rounded-full px-2 py-0.5",
                      set.completed
                        ? "bg-gradient-to-r from-[#2263ff] to-[#ff1910] text-white"
                        : "border border-[rgba(34,99,255,0.26)] bg-white/80 text-zinc-500"
                    )}
                  >
                    {set.completed ? "Completada" : "Pendiente"}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <input
                    type="number"
                    placeholder="Kg"
                    value={set.weight}
                    onChange={(event) => handleSetField(index, "weight")(event.target.value)}
                    className="w-full rounded-xl border border-[rgba(34,99,255,0.26)] bg-white/90 px-2 py-1"
                    min="0"
                    step="0.5"
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(event) => handleSetField(index, "reps")(event.target.value)}
                    className="w-full rounded-xl border border-[rgba(34,99,255,0.26)] bg-white/90 px-2 py-1"
                    min="0"
                  />
                  <input
                    type="number"
                    placeholder="RIR"
                    value={set.rir}
                    onChange={(event) => handleSetField(index, "rir")(event.target.value)}
                    className="w-full rounded-xl border border-[rgba(34,99,255,0.26)] bg-white/90 px-2 py-1"
                    min="0"
                    max="5"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <button type="button" onClick={addExtraSet} className="rounded-full border border-[rgba(34,99,255,0.24)] px-3 py-1 text-xs font-medium text-zinc-600">
              Anadir serie
            </button>
            <button type="button" onClick={removeLastSet} className="rounded-full border border-[rgba(34,99,255,0.24)] px-3 py-1 text-xs font-medium text-zinc-600">
              Quitar ultima
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MediaField
              label="Imagen de referencia"
              value={session.mediaImage}
              placeholder="https://..."
              onChange={(value) => setSession((prev) => ({ ...prev, mediaImage: value }))}
            />
            <MediaField
              label="Video de referencia"
              value={session.mediaVideo}
              placeholder="https://..."
              onChange={(value) => setSession((prev) => ({ ...prev, mediaVideo: value }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Notas</label>
            <textarea
              className="w-full rounded border px-3 py-2 text-sm"
              rows={3}
              value={session.notes}
              onChange={(event) => setSession((prev) => ({ ...prev, notes: event.target.value }))}
              placeholder="Puntos tecnicos, ajustes o molestias"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm text-white"
              disabled={!user}
            >
              Guardar registro
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-white/70 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Historial del ejercicio</h2>
        {history.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">
            Todavia no tienes registros para este ejercicio. Guarda tu primera sesion y aparecera aqui.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {history.map((log) => (
              <li key={log.id} className="rounded-xl border px-4 py-3 text-sm text-zinc-600">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                  <span>{formatDate(log.date) ?? "Fecha desconocida"}</span>
                  {log.perceivedEffort && <span>RPE {log.perceivedEffort}</span>}
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {log.sets.map((set, index) => (
                    <div key={index} className="rounded border px-3 py-2 text-xs text-zinc-500">
                      Serie {index + 1}: {set.weight ?? "-"} kg - {set.reps ?? "-"} reps
                      {set.rir ? ` - RIR ${set.rir}` : ""}
                      {set.completed ? " - OK" : ""}
                    </div>
                  ))}
                </div>
                {log.notes && <p className="mt-2 text-xs">Notas: {log.notes}</p>}
                {(log.mediaImage || log.mediaVideo) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-500">
                    {log.mediaImage && (
                      <a href={log.mediaImage} target="_blank" rel="noreferrer" className="underline">
                        Ver imagen
                      </a>
                    )}
                    {log.mediaVideo && (
                      <a href={log.mediaVideo} target="_blank" rel="noreferrer" className="underline">
                        Ver video
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type ChipProps = { label: string };

function Chip({ label }: ChipProps) {
  return (
    <span className="rounded-full border border-zinc-200 bg-white/60 px-3 py-1 text-xs text-zinc-600">
      {label}
    </span>
  );
}

type MediaShowcaseProps = {
  image?: string;
  video?: string;
};

function MediaShowcase({ image, video }: MediaShowcaseProps) {
  if (!image && !video) {
    return null;
  }
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {image && (
        <figure className="overflow-hidden rounded-2xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Referencia del ejercicio" className="h-full w-full object-cover" loading="lazy" />
        </figure>
      )}
      {video && (
        <div className="rounded-2xl border bg-black/90 p-2">
          <video controls preload="metadata" className="w-full rounded-xl">
            <source src={video} type="video/mp4" />
            Tu navegador no soporta video embebido.
          </video>
        </div>
      )}
    </section>
  );
}

type MediaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

function MediaField({ label, value, placeholder, onChange }: MediaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-zinc-500">{label}</label>
      <input
        type="url"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </div>
  );
}