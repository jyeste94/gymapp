"use client";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { ArrowLeft, Check, Circle, Eye, Plus, Search, Trash2, X } from "lucide-react";
import type { ExerciseCatalogEntry } from "@/lib/data/exercise-catalog";
import { createRoutineTemplate } from "@/lib/firestore/routines";
import {
  buildRoutinePayload,
  type BuilderDay,
  type RoutineFormState,
  validateRoutineForm,
} from "@/lib/routine-helpers";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const createDay = (index: number): BuilderDay => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `day-${Date.now()}-${index}`,
  title: `Dia ${index + 1}`,
  focus: "",
  notes: "",
  exercises: [],
});

const buildDefaultState = (dayCount = 1): RoutineFormState => ({
  title: "",
  description: "",
  focus: "",
  level: "Intermedio",
  frequency: "",
  equipment: "Barra, Mancuernas",
  days: Array.from({ length: dayCount }, (_, index) => createDay(index)),
});

type Props = {
  open: boolean;
  userId?: string | null;
  onClose: () => void;
  onCreated?: () => void;
  exercises: ExerciseCatalogEntry[];
};

type ViewState =
  | { type: "overview" }
  | { type: "day"; dayId: string }
  | { type: "picker"; dayId: string };

type CreatorStep = {
  id: number;
  label: string;
  active: boolean;
  done: boolean;
};

export default function CreateRoutineDrawer({ open, userId, exercises, onClose, onCreated }: Props) {
  const [form, setForm] = useState<RoutineFormState>(() => buildDefaultState());
  const [view, setView] = useState<ViewState>({ type: "overview" });
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");

  useEffect(() => {
    if (!open) return;
    const fresh = buildDefaultState();
    setForm(fresh);
    setSelectedDayId(fresh.days[0]?.id ?? null);
    setView({ type: "overview" });
    setSaving(false);
    setError(null);
    setSearchTerm("");
    setMuscleFilter("");
    setEquipmentFilter("");
  }, [open]);

  const dayById = (dayId: string | null) => (dayId ? form.days.find((day) => day.id === dayId) ?? null : null);
  const selectedDay = dayById(selectedDayId) ?? form.days[0] ?? null;

  const availableMuscles = useMemo(() => {
    const tags = new Set<string>();
    exercises.forEach((exercise) => {
      exercise.muscleGroup.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags.values()).sort((a, b) => a.localeCompare(b));
  }, [exercises]);

  const availableEquipment = useMemo(() => {
    const tags = new Set<string>();
    exercises.forEach((exercise) => {
      exercise.equipment.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags.values()).sort((a, b) => a.localeCompare(b));
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const term = normalize(searchTerm);
    return exercises.filter((exercise) => {
      if (term) {
        const matchesName = normalize(exercise.name).includes(term);
        if (!matchesName && !exercise.keywords.includes(term)) {
          return false;
        }
      }
      if (muscleFilter) {
        const hasMuscle = exercise.muscleGroup.some((tag) => normalize(tag) === normalize(muscleFilter));
        if (!hasMuscle) return false;
      }
      if (equipmentFilter) {
        const hasEquipment = exercise.equipment.some((tag) => normalize(tag) === normalize(equipmentFilter));
        if (!hasEquipment) return false;
      }
      return true;
    });
  }, [equipmentFilter, exercises, muscleFilter, searchTerm]);

  const updateDay = (dayId: string, updater: (day: BuilderDay) => BuilderDay) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((day) => (day.id === dayId ? updater(day) : day)),
    }));
  };

  const addExerciseToDay = (dayId: string, exercise: ExerciseCatalogEntry) => {
    updateDay(dayId, (day) => {
      if (day.exercises.some((item) => item.id === exercise.id)) {
        return day;
      }
      return {
        ...day,
        exercises: [
          ...day.exercises,
          {
            ...exercise,
            sets: 3,
            repRange: "10-12",
            rest: "90 s",
            tip: "",
          },
        ],
      };
    });
  };

  const removeExerciseFromDay = (dayId: string, exerciseId: string) => {
    updateDay(dayId, (day) => ({
      ...day,
      exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
  };

  const handleClose = () => {
    const isDirty = form.title.trim().length > 0 || form.days.length > 1 || form.days.some((day) => day.exercises.length > 0);
    if (!isDirty) {
      onClose();
      return;
    }
    if (window.confirm("Tienes cambios sin guardar. Si cierras, se perderan.")) {
      onClose();
    }
  };

  const handleDayCountChange = (count: number) => {
    setForm((prev) => {
      const current = prev.days.length;
      let days = prev.days;

      if (count > current) {
        const extras = Array.from({ length: count - current }, (_, index) => createDay(current + index));
        days = [...prev.days, ...extras];
      } else if (count < current) {
        days = prev.days.slice(0, count);
      }

      const nextSelected = days.find((day) => day.id === selectedDayId)?.id ?? days[0]?.id ?? null;
      setSelectedDayId(nextSelected);
      if (view.type !== "overview") {
        setView({ type: "overview" });
      }
      return { ...prev, days };
    });
  };

  const validationError = validateRoutineForm(form, userId);
  const canSave = !validationError && !saving;

  const handleSave = async () => {
    if (!userId || !canSave) return;
    try {
      setSaving(true);
      setError(null);
      await createRoutineTemplate(null, userId, buildRoutinePayload(form));
      onCreated?.();
      onClose();
    } catch (caughtError) {
      console.error("create routine failed", caughtError);
      setError(
        `Error al guardar: ${caughtError instanceof Error ? caughtError.message : "No se pudo completar la accion."}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const openDay = (dayId: string) => {
    setSelectedDayId(dayId);
    setView({ type: "day", dayId });
  };

  const renderContent = () => {
    if (view.type === "day") {
      const day = dayById(view.dayId);
      if (!day) {
        return (
          <Overview
            form={form}
            selectedDayId={selectedDay?.id ?? null}
            onSelectDay={openDay}
            onChange={(updater) => setForm((prev) => updater(prev))}
            onDayCountChange={handleDayCountChange}
          />
        );
      }
      return (
        <DayDetail
          day={day}
          onBack={() => setView({ type: "overview" })}
          onAddExercise={() => {
            setSelectedDayId(day.id);
            setView({ type: "picker", dayId: day.id });
            setSearchTerm("");
          }}
          onUpdate={(updater) => updateDay(day.id, updater)}
          onRemoveExercise={(exerciseId) => removeExerciseFromDay(day.id, exerciseId)}
        />
      );
    }

    if (view.type === "picker") {
      const day = dayById(view.dayId);
      if (!day) {
        return (
          <Overview
            form={form}
            selectedDayId={selectedDay?.id ?? null}
            onSelectDay={openDay}
            onChange={(updater) => setForm((prev) => updater(prev))}
            onDayCountChange={handleDayCountChange}
          />
        );
      }
      return (
        <ExercisePicker
          exercises={filteredExercises}
          availableMuscles={availableMuscles}
          availableEquipment={availableEquipment}
          muscleFilter={muscleFilter}
          equipmentFilter={equipmentFilter}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onMuscleFilter={setMuscleFilter}
          onEquipmentFilter={setEquipmentFilter}
          onClose={() => setView({ type: "day", dayId: day.id })}
          onSelect={(exercise) => {
            addExerciseToDay(day.id, exercise);
            setView({ type: "day", dayId: day.id });
          }}
        />
      );
    }

    return (
      <Overview
        form={form}
        selectedDayId={selectedDay?.id ?? null}
        onSelectDay={openDay}
        onChange={(updater) => setForm((prev) => updater(prev))}
        onDayCountChange={handleDayCountChange}
      />
    );
  };

  const footerMessage = validationError || "Completa los datos para guardar la rutina.";
  const step = view.type === "overview" ? 1 : view.type === "day" ? 2 : 3;
  const stepItems: CreatorStep[] = [
    { id: 1, label: "Estructura", active: step === 1, done: step > 1 },
    { id: 2, label: "Dia", active: step === 2, done: step > 2 },
    { id: 3, label: "Ejercicios", active: step === 3, done: false },
  ];

  return (
    <div
      className={clsx("fixed inset-0 z-[150] transition", open ? "pointer-events-auto" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={clsx("absolute inset-0 bg-black/45 transition", open ? "opacity-100" : "opacity-0")}
        onClick={handleClose}
      />

      <aside
        className={clsx(
          "absolute right-0 top-0 h-full w-full transform border-l border-apple-near-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] transition-transform duration-300 sm:max-w-3xl dark:border-white/10 dark:bg-apple-surface-1",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <header className="apple-divider flex items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="space-y-1">
              <p className="apple-kicker">Rutinas</p>
              <h2 className="sf-text-title text-apple-near-black dark:text-white">Crear rutina personalizada</h2>
              <RoutineCreatorSteps items={stepItems} />
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="btn-apple-ghost inline-flex h-10 w-10 items-center justify-center rounded-full p-0"
              aria-label="Cerrar creador"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{renderContent()}</div>

          {view.type === "overview" && (
            <footer className="apple-divider px-4 py-4 sm:px-6 sm:py-5">
              {error && <p className="mb-3 sf-text-caption text-[#ff3b30]">{error}</p>}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">{footerMessage}</p>
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
                  <button type="button" onClick={handleClose} className="btn-apple-ghost w-full sm:w-auto">
                    Cancelar
                  </button>
                  <button type="button" onClick={handleSave} disabled={!canSave} className="btn-apple-primary w-full sm:w-auto">
                    {saving ? "Guardando..." : "Guardar rutina"}
                  </button>
                </div>
              </div>
            </footer>
          )}
        </div>
      </aside>
    </div>
  );
}

function Overview({
  form,
  selectedDayId,
  onSelectDay,
  onChange,
  onDayCountChange,
}: {
  form: RoutineFormState;
  selectedDayId: string | null;
  onSelectDay: (dayId: string) => void;
  onChange: (updater: (prev: RoutineFormState) => RoutineFormState) => void;
  onDayCountChange: (count: number) => void;
}) {
  const dayCountOptions = [1, 2, 3, 4, 5, 6];
  const totalExercises = form.days.reduce((sum, day) => sum + day.exercises.length, 0);
  const completedDays = form.days.filter((day) => day.exercises.length > 0).length;

  return (
    <section className="space-y-6">
      <div className="apple-panel-muted rounded-2xl p-4">
        <p className="sf-text-caption-strong text-apple-near-black dark:text-white">Resumen actual</p>
        <p className="mt-1 sf-text-caption text-apple-near-black/65 dark:text-white/65">
          {form.days.length} dias, {completedDays} con ejercicios, {totalExercises} ejercicios totales.
        </p>
      </div>

      <div className="space-y-3">
        <p className="sf-text-caption-strong text-apple-near-black dark:text-white">Paso 1. Cuantos dias tendra la rutina</p>
        <div className="flex flex-wrap gap-2">
          {dayCountOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onDayCountChange(option)}
              className={clsx(
                "rounded-full border px-3 py-1.5 sf-text-caption transition",
                form.days.length === option
                  ? "border-apple-blue bg-apple-blue text-white"
                  : "border-apple-near-black/10 bg-white text-apple-near-black/80 hover:border-apple-blue hover:text-apple-blue dark:border-white/15 dark:bg-apple-surface-2 dark:text-white/75",
              )}
            >
              {option} dias
            </button>
          ))}
        </div>
      </div>

      <div className="apple-panel-muted grid gap-4 p-5 md:grid-cols-2">
        <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
          Nombre de la rutina
          <input
            value={form.title}
            onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Empuje - Tiron - Pierna"
          />
        </label>

        <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
          Objetivo
          <input
            value={form.focus}
            onChange={(event) => onChange((prev) => ({ ...prev, focus: event.target.value }))}
            placeholder="Hipertrofia"
          />
        </label>

        <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
          Nivel
          <select value={form.level} onChange={(event) => onChange((prev) => ({ ...prev, level: event.target.value }))}>
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </label>

        <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
          Frecuencia
          <input
            value={form.frequency}
            onChange={(event) => onChange((prev) => ({ ...prev, frequency: event.target.value }))}
            placeholder="4 dias por semana"
          />
        </label>
      </div>

      <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
        Descripcion
        <textarea
          rows={3}
          value={form.description}
          onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Describe estructura y notas generales de la rutina."
        />
      </label>

      <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
        Material necesario
        <input
          value={form.equipment}
          onChange={(event) => onChange((prev) => ({ ...prev, equipment: event.target.value }))}
          placeholder="Barra, mancuernas, polea"
        />
      </label>

      <div className="space-y-3">
        <p className="sf-text-caption-strong text-apple-near-black dark:text-white">Paso 2. Configura cada dia</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {form.days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              className={clsx(
                "apple-panel-muted flex flex-col items-start gap-1.5 p-4 text-left transition",
                selectedDayId === day.id ? "border-apple-blue/60" : "hover:-translate-y-0.5",
              )}
            >
              <span className="sf-text-caption-strong text-apple-near-black dark:text-white">{day.title}</span>
              <span className="sf-text-caption text-apple-near-black/60 dark:text-white/60">
                {day.exercises.length > 0 ? `${day.exercises.length} ejercicios` : "Sin ejercicios"}
              </span>
              <span className="mt-1 sf-text-nano uppercase tracking-widest text-apple-blue">Editar dia</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function DayDetail({
  day,
  onBack,
  onAddExercise,
  onUpdate,
  onRemoveExercise,
}: {
  day: BuilderDay;
  onBack: () => void;
  onAddExercise: () => void;
  onUpdate: (updater: (prev: BuilderDay) => BuilderDay) => void;
  onRemoveExercise: (exerciseId: string) => void;
}) {
  return (
    <section className="space-y-5">
      <button type="button" onClick={onBack} className="apple-link inline-flex items-center gap-2 sf-text-caption-strong">
        <ArrowLeft className="h-4 w-4" /> Volver a la rutina
      </button>

      <div className="apple-panel-muted rounded-2xl p-4">
        <p className="sf-text-caption-strong text-apple-near-black dark:text-white">{day.title}</p>
        <p className="mt-1 sf-text-caption text-apple-near-black/65 dark:text-white/65">
          {day.exercises.length > 0 ? `${day.exercises.length} ejercicios configurados` : "Aun no hay ejercicios en este dia"}
        </p>
      </div>

      <div className="apple-panel-muted grid gap-4 p-5 md:grid-cols-2">
        <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
          Nombre del dia
          <input value={day.title} onChange={(event) => onUpdate((prev) => ({ ...prev, title: event.target.value }))} />
        </label>

        <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
          Foco del dia
          <input value={day.focus} onChange={(event) => onUpdate((prev) => ({ ...prev, focus: event.target.value }))} />
        </label>
      </div>

      <label className="space-y-2 sf-text-caption text-apple-near-black/65 dark:text-white/65">
        Notas
        <textarea rows={2} value={day.notes} onChange={(event) => onUpdate((prev) => ({ ...prev, notes: event.target.value }))} />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="sf-text-body-emphasis text-apple-near-black dark:text-white">Ejercicios del dia</h3>
        <button type="button" onClick={onAddExercise} className="btn-apple-pill inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Agregar ejercicio
        </button>
      </div>

      {day.exercises.length === 0 ? (
        <p className="apple-panel-muted sf-text-caption p-4 text-apple-near-black/60 dark:text-white/60">
          No hay ejercicios aun. Usa Agregar ejercicio para empezar.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {day.exercises.map((exercise) => (
            <li key={exercise.id} className="apple-panel-muted flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="sf-text-caption-strong text-apple-near-black dark:text-white">{exercise.name}</p>
                <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">
                  {exercise.sets} x {exercise.repRange} - descanso {exercise.rest}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/exercises/detail?id=${exercise.id}&from=creator`} className="btn-apple-ghost inline-flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" /> Ver
                </Link>
                <button
                  type="button"
                  onClick={() => onRemoveExercise(exercise.id)}
                  className="btn-apple-ghost inline-flex items-center gap-1.5 text-[#ff3b30] hover:text-[#ff3b30]"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function RoutineCreatorSteps({ items }: { items: CreatorStep[] }) {
  return (
    <ol className="mt-2 flex flex-wrap items-center gap-3">
      {items.map((item) => (
        <li key={item.id} className="inline-flex items-center gap-1.5">
          {item.done ? (
            <Check className="h-3.5 w-3.5 text-apple-blue" />
          ) : (
            <Circle className={clsx("h-3.5 w-3.5", item.active ? "text-apple-blue" : "text-apple-near-black/35 dark:text-white/35")} />
          )}
          <span className={clsx("sf-text-micro", item.active ? "font-semibold text-apple-near-black dark:text-white" : "text-apple-near-black/55 dark:text-white/55")}>
            {item.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function ExercisePicker({
  exercises,
  availableMuscles,
  availableEquipment,
  muscleFilter,
  equipmentFilter,
  searchTerm,
  onSearch,
  onMuscleFilter,
  onEquipmentFilter,
  onSelect,
  onClose,
}: {
  exercises: ExerciseCatalogEntry[];
  availableMuscles: string[];
  availableEquipment: string[];
  muscleFilter: string;
  equipmentFilter: string;
  searchTerm: string;
  onSearch: (value: string) => void;
  onMuscleFilter: (value: string) => void;
  onEquipmentFilter: (value: string) => void;
  onSelect: (exercise: ExerciseCatalogEntry) => void;
  onClose: () => void;
}) {
  return (
    <section className="space-y-4">
      <button type="button" onClick={onClose} className="apple-link inline-flex items-center gap-2 sf-text-caption-strong">
        <ArrowLeft className="h-4 w-4" /> Volver al dia
      </button>

      <div className="space-y-1">
        <h3 className="sf-text-subheading text-apple-near-black dark:text-white">Selecciona ejercicios</h3>
        <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">
          Filtra por nombre, grupo muscular o material y agrega directamente al dia.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-near-black/35 dark:text-white/35" />
          <input
            className="pl-9"
            placeholder="Press banca, espalda, superseries..."
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>

        <select value={muscleFilter} onChange={(event) => onMuscleFilter(event.target.value)}>
          <option value="">Musculo</option>
          {availableMuscles.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <select value={equipmentFilter} onChange={(event) => onEquipmentFilter(event.target.value)}>
          <option value="">Material</option>
          {availableEquipment.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-[24rem] space-y-3 overflow-y-auto pr-1">
        {exercises.length === 0 ? (
          <p className="apple-panel-muted sf-text-caption p-4 text-apple-near-black/60 dark:text-white/60">
            No se encontraron ejercicios para esos filtros.
          </p>
        ) : (
          exercises.map((exercise) => (
            <article key={exercise.id} className="apple-panel-muted space-y-2 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="sf-text-body-emphasis text-apple-near-black dark:text-white">{exercise.name}</p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/exercises/detail?id=${exercise.id}&from=creator`}
                    className="btn-apple-ghost inline-flex items-center gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ver ficha
                  </Link>
                  <button type="button" onClick={() => onSelect(exercise)} className="btn-apple-pill-dark">
                    Agregar
                  </button>
                </div>
              </div>

              <p className="sf-text-caption text-apple-near-black/60 dark:text-white/60">{exercise.description}</p>

              <div className="flex flex-wrap gap-2">
                {exercise.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-apple-near-black/10 bg-white px-2.5 py-0.5 sf-text-nano text-apple-near-black/65 dark:border-white/15 dark:bg-apple-surface-2 dark:text-white/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
