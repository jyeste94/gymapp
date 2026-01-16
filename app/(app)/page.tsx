"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import type { Measurement, Routine, RoutineTemplate } from "@/lib/types";
import { defaultRoutines } from "@/lib/data/routine-library";
import { defaultExercises } from "@/lib/data/exercises";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";

type MetricVariant = "blue" | "amber" | "rose";
type RoutineAccent = "blue" | "amber" | "rose" | "navy";

const ROUTINE_ACCENTS: RoutineAccent[] = ["blue", "amber", "rose", "navy"];

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
  const { user } = useAuth();
  const measurementPath = user?.uid ? `users/${user.uid}/measurements` : null;
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const { data: measurements, loading: measurementsLoading } = useCol<Measurement>(measurementPath, {
    by: "date",
    dir: "desc",
  });

  const { data: routineTemplates, loading: templatesLoading } = useCol<RoutineTemplate>(templatesPath, {
    by: "title",
    dir: "desc",
  });

  const customRoutines = useMemo(
    () => (routineTemplates ?? []).map(template => buildRoutine(template, defaultExercises)),
    [routineTemplates],
  );

  const routines = useMemo(() => mergeRoutines(customRoutines, defaultRoutines), [customRoutines]);
  const featuredRoutines = routines.slice(0, 4);

  const latestMeasurements = measurements.slice(0, 4);
  const lastMeasurement = measurements[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Calorias ingeridas"
          value="Proximamente"
          helper="Sincroniza tu dieta para ver este dato"
          variant="blue"
        />
        <MetricCard
          title="Ultimo peso"
          value={
            measurementsLoading
              ? "Cargando..."
              : lastMeasurement
                ? `${lastMeasurement.weightKg.toFixed(1)} kg`
                : "Sin datos"
          }
          helper={lastMeasurement ? `Registrado el ${formatDate(lastMeasurement.date) ?? "-"}` : "Anade tu primera medicion"}
          variant="amber"
        />
        <MetricCard
          title="Indice de grasa"
          value={
            measurementsLoading
              ? "Cargando..."
              : lastMeasurement?.bodyFatPct
                ? `${lastMeasurement.bodyFatPct.toFixed(1)} %`
                : "Sin registro"
          }
          helper="Basado en tu medicion mas reciente"
          variant="rose"
        />
      </section>

      <section className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#51607c]">Rutinas</p>
            <h2 className="text-lg font-semibold text-[#0a2e5c]">Tus planes recientes</h2>
          </div>
          <Link href="/routines" className="text-xs font-semibold text-[#0a2e5c] underline">
            Ver todas
          </Link>
        </div>

        {templatesLoading && routines.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[rgba(10,46,92,0.2)] bg-white/60 p-6 text-sm text-[#51607c]">
            Cargando rutinas...
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredRoutines.map((routine, index) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                accent={ROUTINE_ACCENTS[index % ROUTINE_ACCENTS.length]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#51607c]">Mediciones</p>
            <h2 className="text-lg font-semibold text-[#0a2e5c]">Historial reciente</h2>
          </div>
          <Link href="/measurements" className="text-xs font-semibold text-[#0a2e5c] underline">
            Ver todas
          </Link>
        </div>

        {measurementsLoading && latestMeasurements.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[rgba(10,46,92,0.2)] bg-white/60 p-6 text-sm text-[#51607c]">
            Cargando mediciones...
          </div>
        ) : latestMeasurements.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[rgba(10,46,92,0.2)] bg-white/60 p-6 text-sm text-[#51607c]">
            Todavia no registras mediciones. A?ade tu primera lectura para verla aqui.
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {latestMeasurements.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(10,46,92,0.16)] bg-white/90 px-4 py-3 text-sm text-[#4b5a72]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0a2e5c]">{formatDate(entry.date) ?? "Fecha desconocida"}</p>
                  <p className="text-xs text-[#51607c]">Peso: {entry.weightKg.toFixed(1)} kg</p>
                </div>
                <div className="text-right text-xs text-[#51607c]">
                  {entry.bodyFatPct ? `Grasa: ${entry.bodyFatPct.toFixed(1)} %` : "Grasa sin registrar"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  helper: string;
  variant?: MetricVariant;
};

function MetricCard({ title, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-[rgba(10,46,92,0.16)] bg-white p-6 text-sm text-[#4b5a72] shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-[#51607c]">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-[#0a2e5c]">{value}</p>
      <p className="mt-4 text-xs text-[#51607c]">{helper}</p>
    </div>
  );
}

type RoutineCardProps = {
  routine: Routine;
  accent?: RoutineAccent;
};

function RoutineCard({ routine }: RoutineCardProps) {
  const dayCount = routine.days.length;
  const exerciseCount = routine.days.reduce((sum, day) => sum + day.exercises.length, 0);
  return (
    <Link
      href={`/routines/${routine.id}`}
      className="group relative flex flex-col gap-4 rounded-3xl border border-[rgba(10,46,92,0.18)] bg-white/80 p-5 text-sm text-[#4b5a72] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#51607c]">{routine.level}</p>
          <h3 className="mt-1 text-lg font-semibold text-[#0a2e5c]">{routine.title}</h3>
        </div>
        {routine.level && <span className="tag-pill">{routine.level}</span>}
      </div>
      {routine.description && <p className="text-xs text-[#51607c]">{routine.description}</p>}
      <div className="flex flex-wrap gap-2 text-xs text-[#51607c]">
        <span className="rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5">{dayCount} dias</span>
        <span className="rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5">{exerciseCount} ejercicios</span>
        {routine.frequency && (
          <span className="rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5">{routine.frequency}</span>
        )}
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0a2e5c]">
        Abrir rutina <span>{">"}</span>
      </span>
    </Link>
  );
}
