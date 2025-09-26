"use client";
import { useMemo } from "react";
import clsx from "clsx";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import type { Measurement, WorkoutSession } from "@/lib/types";

type RoutineLog = {
  id: string;
  date: string;
  entries: {
    day: string;
    exercise: string;
    weight?: string;
    reps?: string;
    comment?: string;
  }[];
};

const quickActions = [
  { label: "Registrar medicion", hint: "Peso y % grasa" },
  { label: "Empezar entrenamiento", hint: "Cronometro y sets" },
  { label: "Planificar dieta", hint: "Macros del dia" },
  { label: "Guardar rutina", hint: "Peso y repeticiones" },
];

const formatter =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" })
    : null;

const formatDate = (iso?: string) => {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    return formatter ? formatter.format(date) : iso.split("T")[0];
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const measurementPath = user?.uid ? `users/${user.uid}/measurements` : null;
  const routinesPath = user?.uid ? `users/${user.uid}/routines` : null;
  const workoutsPath = user?.uid ? `users/${user.uid}/workouts` : null;

  const {
    data: measurements,
    loading: measurementsLoading,
  } = useCol<Measurement>(measurementPath, { by: "date", dir: "desc" });

  const {
    data: routineLogs,
    loading: routinesLoading,
  } = useCol<RoutineLog>(routinesPath, { by: "date", dir: "desc" });

  const {
    data: workouts,
    loading: workoutsLoading,
  } = useCol<WorkoutSession>(workoutsPath, { by: "date", dir: "desc" });

  const lastMeasurement = measurements[0];
  const lastWorkout = workouts[0];
  const latestRoutineLog = routineLogs[0];

  const routinePreview = useMemo(() => {
    if (!latestRoutineLog) return null;
    const map = new Map<string, { name: string; exercises: string[] }>();
    latestRoutineLog.entries.forEach((entry) => {
      const existing = map.get(entry.day);
      if (existing) {
        if (existing.exercises.length < 4) existing.exercises.push(entry.exercise);
        return;
      }
      map.set(entry.day, { name: entry.day, exercises: [entry.exercise] });
    });
    const groups = Array.from(map.values());
    return groups[0] ?? null;
  }, [latestRoutineLog]);

  const greeting = loading ? "Cargando perfil..." : user?.email ?? "atleta";
  const hasData = Boolean(user);

  const statCards = [
    {
      title: "Ultima medicion",
      value: measurementsLoading
        ? "Cargando..."
        : lastMeasurement
        ? `${lastMeasurement.weightKg.toFixed(1)} kg`
        : "Sin datos",
      helperText: lastMeasurement
        ? `Tomada el ${formatDate(lastMeasurement.date) ?? "-"}`
        : "Registra tu primera medicion",
      accent: "from-[rgba(34,99,255,0.18)] via-white to-[rgba(34,99,255,0.06)]",
    },
    {
      title: "Indice de grasa",
      value: measurementsLoading
        ? "Cargando..."
        : lastMeasurement?.bodyFatPct
        ? `${lastMeasurement.bodyFatPct.toFixed(1)} %`
        : "Sin registro",
      helperText: "Basado en tu medicion mas reciente",
      accent: "from-[rgba(255,174,0,0.24)] via-white to-[rgba(34,99,255,0.08)]",
    },
    {
      title: "Rutinas guardadas",
      value: routinesLoading
        ? "Cargando..."
        : routineLogs.length
        ? `${routineLogs.length} entradas`
        : "Sin registros",
      helperText: latestRoutineLog
        ? `Ultima rutina: ${formatDate(latestRoutineLog.date) ?? "-"}`
        : "Captura tus rutinas para hacer seguimiento",
      accent: "from-[rgba(34,99,255,0.14)] via-[rgba(255,25,16,0.14)] to-white",
    },
    {
      title: "Sesiones completas",
      value: workoutsLoading
        ? "Cargando..."
        : workouts.length
        ? `${workouts.length} sesiones`
        : "Sin registros",
      helperText: lastWorkout
        ? `Ultimo entreno: ${formatDate(lastWorkout.date) ?? "-"}`
        : "Inicia una sesion para ver el historial",
      accent: "from-[rgba(255,174,0,0.22)] via-white to-[rgba(255,25,16,0.12)]",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-card border-[rgba(34,99,255,0.16)] bg-white/75 p-5 text-sm text-zinc-600">Hola {greeting}, este es tu resumen personal de la semana.</div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <DashboardStatCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="glass-card border-[rgba(34,99,255,0.16)] bg-white/75 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Rutina pendiente</p>
              <h2 className="text-xl font-semibold text-zinc-900">Tu siguiente dia de entrenamiento</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Revisa los ejercicios destacados y prepárate antes de entrar al gimnasio.
              </p>
            </div>
            {latestRoutineLog && (
              <span className="tag-pill text-[0.7rem]">Guardada el {formatDate(latestRoutineLog.date) ?? "-"}</span>
            )}
          </div>

          {!hasData && (
            <p className="mt-6 text-sm text-zinc-500">
              Inicia sesion para sincronizar tus rutinas guardadas y registrar avances.
            </p>
          )}

          {hasData && routinesLoading && (
            <div className="mt-6 animate-pulse rounded-2xl border border-dashed border-[rgba(34,99,255,0.24)] bg-white/50 p-6 text-sm text-zinc-500">
              Cargando rutinas guardadas...
            </div>
          )}

          {hasData && !routinesLoading && !routinePreview && (
            <div className="mt-6 rounded-2xl border border-dashed border-[rgba(34,99,255,0.24)] bg-white/50 p-6 text-sm text-zinc-500">
              Todavia no has guardado rutinas. Crea tu plan desde la seccion Rutinas para visualizarlo aqui.
            </div>
          )}

          {hasData && routinePreview && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[rgba(34,99,255,0.16)] bg-white/80 p-5">
                <h3 className="text-base font-semibold text-zinc-900">{routinePreview.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.35em] text-zinc-400">Ejercicios destacados</p>
                <ul className="mt-4 space-y-3 text-sm text-zinc-700">
                  {routinePreview.exercises.map((exercise) => (
                    <li key={exercise} className="flex items-center justify-between rounded-xl border border-[rgba(34,99,255,0.2)] bg-white/80 px-3 py-2">
                      <span>{exercise}</span>
                      <span className="text-xs text-zinc-400">Preparar</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[rgba(34,99,255,0.16)] bg-gradient-to-br from-[rgba(34,99,255,0.12)] via-[rgba(255,174,0,0.12)] to-[rgba(255,25,16,0.12)] p-5 text-sm text-zinc-700">
                <h3 className="text-base font-semibold text-zinc-900">Checklist pre-entreno</h3>
                <ul className="mt-3 space-y-2">
                  <li>• Revisa tempos y RIR objetivo</li>
                  <li>• Calentamiento articular 5 minutos</li>
                  <li>• Define cargas progresivas para cada set</li>
                </ul>
                <button className="primary-button mt-4">Ir a rutinas</button>
              </div>
            </div>
          )}
        </div>

        <aside className="glass-card border-[rgba(34,99,255,0.16)] bg-white/75 p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Acciones rapidas</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Mantén el impulso con accesos directos a tus tareas frecuentes.
          </p>
          <div className="mt-5 space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="group flex w-full items-center justify-between rounded-2xl border border-[rgba(34,99,255,0.24)] bg-white/70 px-4 py-3 text-left text-sm font-medium text-zinc-700 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span>
                  {action.label}
                  <span className="block text-xs font-normal text-zinc-400">{action.hint}</span>
                </span>
                <span className="text-xs text-zinc-400">→</span>
              </button>
            ))}
          </div>
        </aside>
      </section>

      <section className="glass-card border-[rgba(34,99,255,0.16)] bg-white/75 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Historial rapido</p>
            <h2 className="text-lg font-semibold text-zinc-900">Tus ultimos hitos</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <TimelineCard
            title="Medicion mas reciente"
            value={
              lastMeasurement
                ? `${lastMeasurement.weightKg.toFixed(1)} kg`
                : measurementsLoading
                ? "Cargando..."
                : "Sin datos"
            }
            subtitle={
              lastMeasurement
                ? `Registrada el ${formatDate(lastMeasurement.date) ?? "-"}`
                : "Aun no has guardado mediciones"
            }
            accent="from-[rgba(34,99,255,0.2)] via-white to-[rgba(34,99,255,0.08)]"
          />
          <TimelineCard
            title="Rutina documentada"
            value={
              latestRoutineLog
                ? `${latestRoutineLog.entries.length} ejercicios`
                : routinesLoading
                ? "Cargando..."
                : "Sin datos"
            }
            subtitle={
              latestRoutineLog
                ? `Fecha: ${formatDate(latestRoutineLog.date) ?? "-"}`
                : "Guarda una rutina para ver el resumen"
            }
            accent="from-[rgba(255,174,0,0.22)] via-white to-[rgba(34,99,255,0.06)]"
          />
          <TimelineCard
            title="Ultimo entreno"
            value={
              lastWorkout
                ? `${lastWorkout.sets.length} sets`
                : workoutsLoading
                ? "Cargando..."
                : "Sin datos"
            }
            subtitle={
              lastWorkout
                ? `Realizado el ${formatDate(lastWorkout.date) ?? "-"}`
                : "Todavia no hay sesiones registradas"
            }
            accent="from-[rgba(255,25,16,0.2)] via-white to-[rgba(255,174,0,0.08)]"
          />
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  helperText: string;
  accent: string;
};

function DashboardStatCard({ title, value, helperText, accent }: StatCardProps) {
  return (
    <div className={clsx("relative overflow-hidden rounded-3xl border p-6 text-sm text-zinc-600 shadow-sm", "bg-gradient-to-br", accent)}>
      <div className="absolute inset-0 bg-white/35 mix-blend-screen" aria-hidden />
      <div className="relative space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
        <p className="text-3xl font-semibold text-zinc-900">{value}</p>
        <p className="text-xs text-zinc-600">{helperText}</p>
      </div>
    </div>
  );
}

type TimelineCardProps = {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
};

function TimelineCard({ title, value, subtitle, accent }: TimelineCardProps) {
  return (
    <div className={clsx("rounded-2xl border p-5 text-sm shadow-sm", "bg-gradient-to-br", accent)}>
      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-4 text-xs text-zinc-600">{subtitle}</p>
    </div>
  );
}






