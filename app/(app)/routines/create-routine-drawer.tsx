"use client";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Trash2, X, Eye } from "lucide-react";
import type { ExerciseCatalogEntry } from "@/lib/data/exercise-catalog";
import { createRoutineTemplate } from "@/lib/firestore/routines";
import { validateRoutineForm, buildRoutinePayload, type RoutineFormState, type BuilderDay } from "@/lib/routine-helpers";

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

export default function CreateRoutineDrawer({ open, userId, exercises, onClose, onCreated }: Props) {
  const [form, setForm] = useState<RoutineFormState>(() => buildDefaultState());

  // Safe close handler
  const handleClose = () => {
    const isDirty = form.title.length > 0 || form.days.length > 1 || form.days.some(d => d.exercises.length > 0);
    if (isDirty) {
      if (confirm("Tienes cambios sin guardar. Seguro que quieres cerrar? Se perderan los datos.")) {
        onClose();
      }
    } else {
      onClose();
    }
  };
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

  const selectedDay = form.days.find((day) => day.id === selectedDayId) ?? form.days[0] ?? null;

  const availableMuscles = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((exercise) => {
      exercise.muscleGroup.forEach((tag) => set.add(tag));
    });
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [exercises]);

  const availableEquipment = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((exercise) => {
      exercise.equipment.forEach((tag) => set.add(tag));
    });
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const term = normalize(searchTerm);
    return exercises.filter((exercise) => {
      if (term) {
        const base = exercise.keywords;
        const nameMatch = normalize(exercise.name).includes(term);
        if (!nameMatch && !base.includes(term)) {
          return false;
        }
      }
      if (muscleFilter) {
        const matchesMuscle = exercise.muscleGroup.some(
          (tag) => normalize(tag) === normalize(muscleFilter),
        );
        if (!matchesMuscle) return false;
      }
      if (equipmentFilter) {
        const matchesEquipment = exercise.equipment.some(
          (tag) => normalize(tag) === normalize(equipmentFilter),
        );
        if (!matchesEquipment) return false;
      }
      return true;
    });
  }, [exercises, searchTerm, muscleFilter, equipmentFilter]);

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
        exercises: [...day.exercises, {
          ...exercise,
          sets: 3,
          repRange: "10-12",
          rest: "90 s",
          tip: "",
        }],
      };
    });
  };

  const removeExerciseFromDay = (dayId: string, exerciseId: string) => {
    updateDay(dayId, (day) => ({
      ...day,
      exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
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
      const payload = buildRoutinePayload(form);
      await createRoutineTemplate(null, userId, payload);
      onCreated?.();
      onClose();
    } catch (error) {
      console.error("create routine failed", error);
      setError("Error al guardar: " + (error instanceof Error ? error.message : "Ocurrio un problema desconocido."));
    } finally {
      setSaving(false);
    }
  };

  const footerMessage = validationError || "Revisa los datos antes de guardar.";

  const openDay = (dayId: string) => {
    setSelectedDayId(dayId);
    setView({ type: "day", dayId });
  };

  const renderContent = () => {
    if (view.type === "day" && selectedDay) {
      return (
        <DayDetail
          day={selectedDay}
          onBack={() => setView({ type: "overview" })}
          onAddExercise={() => {
            setView({ type: "picker", dayId: selectedDay.id });
            setSearchTerm("");
          }}
          onUpdate={(updater) => updateDay(selectedDay.id, updater)}
          onRemoveExercise={(exerciseId) => removeExerciseFromDay(selectedDay.id, exerciseId)}
        />
      );
    }

    if (view.type === "picker" && selectedDay) {
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
          onClose={() => setView({ type: "day", dayId: selectedDay.id })}
          onSelect={(exercise) => {
            addExerciseToDay(selectedDay.id, exercise);
            setView({ type: "day", dayId: selectedDay.id });
          }}
        />
      );
    }

    return (
      <Overview
        form={form}
        selectedDayId={selectedDayId}
        onSelectDay={openDay}
        onChange={(updater) => setForm((prev) => updater(prev))}
        onDayCountChange={handleDayCountChange}
      />
    );
  };

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[140] transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        className={clsx(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition opacity-0",
          open && "opacity-100",
        )}
        onClick={handleClose}
      />
      <aside
        className={clsx(
          "absolute right-0 top-0 h-full w-full max-w-3xl transform bg-brand-surface shadow-2xl border-l border-brand-border transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-brand-border px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-brand-text-main">Crea tu rutina</h2>
              <p className="text-sm text-brand-text-muted">
                Define dias, asigna ejercicios y guarda tu plan personalizado.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-text-muted transition hover:border-brand-primary/30 hover:text-brand-text-main"
              aria-label="Cerrar creador"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">{renderContent()}</div>

          {view.type === "overview" && (
            <footer className="border-t border-brand-border px-6 py-5">
              {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-brand-text-muted">
                <p>{footerMessage}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-2xl border border-brand-border px-4 py-2 text-sm font-semibold text-brand-text-muted transition hover:bg-brand-dark"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="rounded-2xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:opacity-60"
                  >
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

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-xs text-brand-text-muted">
          Nombre de la rutina
          <input
            className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
            value={form.title}
            onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Empuje/Tiron + Pierna"
          />
        </label>
        <label className="space-y-2 text-xs text-brand-text-muted">
          Objetivo o foco
          <input
            className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
            value={form.focus}
            onChange={(event) => onChange((prev) => ({ ...prev, focus: event.target.value }))}
            placeholder="Hipertrofia intermedia"
          />
        </label>
        <label className="space-y-2 text-xs text-brand-text-muted">
          Nivel
          <select
            className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
            value={form.level}
            onChange={(event) => onChange((prev) => ({ ...prev, level: event.target.value }))}
          >
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </label>
        <label className="space-y-2 text-xs text-brand-text-muted">
          Frecuencia
          <input
            className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
            value={form.frequency}
            onChange={(event) => onChange((prev) => ({ ...prev, frequency: event.target.value }))}
            placeholder="4 dias"
          />
        </label>
      </div>

      <label className="block space-y-2 text-xs text-brand-text-muted">
        Descripcion
        <textarea
          className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
          rows={3}
          value={form.description}
          onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Describe el objetivo general y recomendaciones."
        />
      </label>

      <label className="block space-y-2 text-xs text-brand-text-muted">
        Material necesario (separado por comas)
        <input
          className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
          value={form.equipment}
          onChange={(event) => onChange((prev) => ({ ...prev, equipment: event.target.value }))}
          placeholder="Barra, Mancuernas, Polea"
        />
      </label>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-brand-text-main">Cuantos dias tiene la rutina?</p>
        <div className="flex flex-wrap gap-2">
          {dayCountOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onDayCountChange(option)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                form.days.length === option
                  ? "border-brand-primary bg-brand-primary/10 text-brand-text-main"
                  : "border-brand-border text-brand-text-muted hover:border-brand-primary/30 hover:text-brand-text-main",
              )}
            >
              {option} dias
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-brand-text-main">Dias del programa</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {form.days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              className={clsx(
                "flex flex-col items-start gap-2 rounded-2xl border border-brand-border bg-brand-dark/70 px-4 py-3 text-left text-sm transition hover:-translate-y-0.5 hover:shadow",
                selectedDayId === day.id && "border-brand-primary bg-brand-primary/5",
              )}
            >
              <span className="font-semibold text-brand-text-main">{day.title}</span>
              <span className="text-xs text-brand-text-muted">
                {day.exercises.length ? `${day.exercises.length} ejercicios` : "Sin ejercicios aun"}
              </span>
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
    <section className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-text-main"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a los dias
      </button>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-xs text-brand-text-muted">
          Nombre del dia
          <input
            className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
            value={day.title}
            onChange={(event) => onUpdate((prev) => ({ ...prev, title: event.target.value }))}
          />
        </label>
        <label className="space-y-2 text-xs text-brand-text-muted">
          Foco del dia
          <input
            className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
            value={day.focus}
            onChange={(event) => onUpdate((prev) => ({ ...prev, focus: event.target.value }))}
          />
        </label>
      </div>

      <label className="block space-y-2 text-xs text-brand-text-muted">
        Notas
        <textarea
          className="w-full rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
          rows={2}
          value={day.notes}
          onChange={(event) => onUpdate((prev) => ({ ...prev, notes: event.target.value }))}
        />
      </label>

      <div className="flex justify-between">
        <h3 className="text-sm font-semibold text-brand-text-main">Ejercicios asignados</h3>
        <button
          type="button"
          onClick={onAddExercise}
          className="inline-flex items-center gap-1 rounded-full border border-brand-border px-3 py-1 text-xs font-semibold text-brand-text-main transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar ejercicio
        </button>
      </div>

      {day.exercises.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-brand-border bg-brand-dark/60 px-4 py-3 text-xs text-brand-text-muted">
          Todavia no has agregado ejercicios a este dia.
        </p>
      ) : (
        <ul className="space-y-2">
          {day.exercises.map((exercise) => (
            <li
              key={exercise.id}
              className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-dark/60 px-4 py-3 text-sm text-brand-text-muted"
            >
              <div>
                <p className="font-semibold text-brand-text-main">{exercise.name}</p>
                <p className="text-xs text-brand-text-muted">
                  {exercise.sets}x {exercise.repRange} - {exercise.rest} descanso
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExercise(exercise.id)}
                className="inline-flex items-center gap-1 rounded-full border border-brand-border bg-brand-dark px-3 py-1 text-xs text-brand-text-muted transition hover:border-brand-primary/30 hover:text-brand-primary"
              >
                <Trash2 className="h-3.5 w-3.5" /> Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
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
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-2 text-xs font-semibold text-brand-text-main"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al dia
      </button>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-brand-text-main">Selecciona ejercicios</h3>
        <p className="text-xs text-brand-text-muted">
          Filtra por nombre, musculo o material, revisa la ficha del ejercicio y agregalo al dia.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
          <input
            className="w-full rounded-2xl border border-brand-border bg-brand-dark px-9 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
            placeholder="Press banca, espalda, superseries..."
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
        <select
          className="rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
          value={muscleFilter}
          onChange={(event) => onMuscleFilter(event.target.value)}
        >
          <option value="">Musculo</option>
          {availableMuscles.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder:text-brand-text-muted/70"
          value={equipmentFilter}
          onChange={(event) => onEquipmentFilter(event.target.value)}
        >
          <option value="">Material</option>
          {availableEquipment.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className="grid max-h-80 gap-3 overflow-y-auto rounded-2xl border border-brand-border bg-brand-dark/55 p-4">
        {exercises.length === 0 ? (
          <p className="text-xs text-brand-text-muted">No se encontraron ejercicios con los filtros actuales.</p>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex flex-col gap-2 rounded-2xl border border-brand-border/70 bg-brand-surface px-4 py-3 text-sm text-brand-text-muted shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col">
                  <p className="font-semibold text-brand-text-main">{exercise.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/exercises/detail?id=${exercise.id}&from=creator`}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-border px-2 py-0.5 text-xs font-semibold text-brand-text-main transition hover:-translate-y-0.5 hover:shadow"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ver ficha
                  </Link>
                  <button
                    type="button"
                    onClick={() => onSelect(exercise)}
                    className="rounded-full border border-brand-border px-3 py-1 text-xs font-semibold text-brand-text-main transition hover:-translate-y-0.5 hover:shadow"
                  >
                    Agregar
                  </button>
                </div>
              </div>
              <p className="text-xs text-brand-text-muted">{exercise.description}</p>
              <div className="flex flex-wrap gap-2 text-[0.65rem] text-brand-text-muted">
                {exercise.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-brand-border px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
