"use client";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Trash2, X, Eye } from "lucide-react";
import type { RoutineExercise } from "@/lib/data/routine-plan";
import type { ExerciseCatalogEntry } from "@/lib/data/exercise-catalog";
import { createRoutineTemplate, type RoutineTemplateInput } from "@/lib/firestore/routines";

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

type BuilderDay = {
  id: string;
  title: string;
  focus: string;
  notes: string;
  exercises: RoutineExercise[];
};

type RoutineFormState = {
  title: string;
  description: string;
  focus: string;
  level: string;
  frequency: string;
  equipment: string;
  days: BuilderDay[];
};

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

  const equipmentList = useMemo(
    () =>
      form.equipment
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    [form.equipment],
  );

  const allDaysHaveExercises = form.days.every((day) => day.exercises.length > 0);

  const canSave = Boolean(userId) && !saving && form.title.trim().length > 2 && allDaysHaveExercises;

  const handleSave = async () => {
    if (!userId || !canSave) return;
    try {
      setSaving(true);
      setError(null);
      const payload: RoutineTemplateInput = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        focus: form.focus.trim() || undefined,
        level: form.level.trim() || undefined,
        frequency: form.frequency.trim() || undefined,
        equipment: equipmentList,
        days: form.days.map((day, index) => ({
          id: day.id,
          title: day.title.trim() || `Dia ${index + 1}`,
          focus: day.focus.trim() || undefined,
          order: index + 1,
          intensity: undefined,
          estimatedDuration: undefined,
          notes: day.notes.trim() || undefined,
          warmup: [],
          finisher: [],
          exercises: day.exercises,
        })),
      };
      await createRoutineTemplate(userId, payload);
      onCreated?.();
      onClose();
    } catch (error) {
      console.error("create routine failed", error);
      setError(error instanceof Error ? error.message : "No se pudo crear la rutina.");
    } finally {
      setSaving(false);
    }
  };

  const footerMessage = !userId
    ? "Inicia sesion para crear tus rutinas."
    : !allDaysHaveExercises
      ? "Cada dia debe tener al menos un ejercicio."
      : "Revisa los datos antes de guardar.";

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
        onClick={onClose}
      />
      <aside
        className={clsx(
          "absolute right-0 top-0 h-full w-full max-w-3xl transform bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#0a2e5c]">Disena tu rutina</h2>
              <p className="text-sm text-[#51607c]">
                Define dias, asigna ejercicios y guarda tu plan personalizado.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-[#4b5a72] transition hover:border-zinc-300 hover:text-[#0a2e5c]"
              aria-label="Cerrar creador"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">{renderContent()}</div>

          {view.type === "overview" && (
            <footer className="border-t border-zinc-200 px-6 py-5">
              {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#51607c]">
                <p>{footerMessage}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-[#4b5a72] transition hover:bg-zinc-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="rounded-2xl bg-[#0a2e5c] px-5 py-2 text-sm font-semibold text-white shadow-sm transition enabled:hover:-translate-y-0.5 enabled:hover:shadow-md disabled:opacity-60"
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
        <label className="space-y-2 text-xs text-[#51607c]">
          Nombre de la rutina
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            value={form.title}
            onChange={(event) => onChange((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Empuje/Tiron + Pierna"
          />
        </label>
        <label className="space-y-2 text-xs text-[#51607c]">
          Objetivo o foco
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            value={form.focus}
            onChange={(event) => onChange((prev) => ({ ...prev, focus: event.target.value }))}
            placeholder="Hipertrofia intermedia"
          />
        </label>
        <label className="space-y-2 text-xs text-[#51607c]">
          Nivel
          <select
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            value={form.level}
            onChange={(event) => onChange((prev) => ({ ...prev, level: event.target.value }))}
          >
            <option value="Principiante">Principiante</option>
            <option value="Intermedio">Intermedio</option>
            <option value="Avanzado">Avanzado</option>
          </select>
        </label>
        <label className="space-y-2 text-xs text-[#51607c]">
          Frecuencia
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            value={form.frequency}
            onChange={(event) => onChange((prev) => ({ ...prev, frequency: event.target.value }))}
            placeholder="4 dias"
          />
        </label>
      </div>

      <label className="block space-y-2 text-xs text-[#51607c]">
        Descripcion
        <textarea
          className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
          rows={3}
          value={form.description}
          onChange={(event) => onChange((prev) => ({ ...prev, description: event.target.value }))}
          placeholder="Describe el objetivo general y recomendaciones."
        />
      </label>

      <label className="block space-y-2 text-xs text-[#51607c]">
        Material necesario (separado por comas)
        <input
          className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={form.equipment}
          onChange={(event) => onChange((prev) => ({ ...prev, equipment: event.target.value }))}
          placeholder="Barra, Mancuernas, Polea"
        />
      </label>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#0a2e5c]">Cuantos dias tiene la rutina?</p>
        <div className="flex flex-wrap gap-2">
          {dayCountOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onDayCountChange(option)}
              className={clsx(
                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                form.days.length === option
                  ? "border-[#0a2e5c] bg-[#0a2e5c]/10 text-[#0a2e5c]"
                  : "border-zinc-200 text-[#51607c] hover:border-[#0a2e5c]/30 hover:text-[#0a2e5c]",
              )}
            >
              {option} dias
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#0a2e5c]">Dias del programa</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {form.days.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDay(day.id)}
              className={clsx(
                "flex flex-col items-start gap-2 rounded-2xl border border-[rgba(10,46,92,0.16)] bg-white px-4 py-3 text-left text-sm transition hover:-translate-y-0.5 hover:shadow",
                selectedDayId === day.id && "border-[#0a2e5c] bg-[#0a2e5c]/5",
              )}
            >
              <span className="font-semibold text-[#0a2e5c]">{day.title}</span>
              <span className="text-xs text-[#51607c]">
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
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#0a2e5c]"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a los dias
      </button>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-xs text-[#51607c]">
          Nombre del dia
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            value={day.title}
            onChange={(event) => onUpdate((prev) => ({ ...prev, title: event.target.value }))}
          />
        </label>
        <label className="space-y-2 text-xs text-[#51607c]">
          Foco del dia
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            value={day.focus}
            onChange={(event) => onUpdate((prev) => ({ ...prev, focus: event.target.value }))}
          />
        </label>
      </div>

      <label className="block space-y-2 text-xs text-[#51607c]">
        Notas
        <textarea
          className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
          rows={2}
          value={day.notes}
          onChange={(event) => onUpdate((prev) => ({ ...prev, notes: event.target.value }))}
        />
      </label>

      <div className="flex justify-between">
        <h3 className="text-sm font-semibold text-[#0a2e5c]">Ejercicios asignados</h3>
        <button
          type="button"
          onClick={onAddExercise}
          className="inline-flex items-center gap-1 rounded-full border border-[rgba(10,46,92,0.24)] px-3 py-1 text-xs font-semibold text-[#0a2e5c] transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" /> Anadir ejercicio
        </button>
      </div>

      {day.exercises.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[rgba(10,46,92,0.18)] bg-white/70 px-4 py-3 text-xs text-[#51607c]">
          Todavia no has anadido ejercicios a este dia.
        </p>
      ) : (
        <ul className="space-y-2">
          {day.exercises.map((exercise) => (
            <li
              key={exercise.id}
              className="flex items-center justify-between rounded-2xl border border-[rgba(10,46,92,0.16)] bg-white px-4 py-3 text-sm text-[#4b5a72]"
            >
              <div>
                <p className="font-semibold text-[#0a2e5c]">{exercise.name}</p>
                <p className="text-xs text-[#51607c]">
                  {exercise.sets}x {exercise.repRange} - {exercise.rest} descanso
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveExercise(exercise.id)}
                className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs text-[#d54545] transition hover:bg-red-50"
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
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#0a2e5c]"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al dia
      </button>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[#0a2e5c]">Selecciona ejercicios</h3>
        <p className="text-xs text-[#51607c]">
          Filtra por nombre, musculo o material, revisa la ficha del ejercicio y a?adelo al dia.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-white px-9 py-2 text-sm"
            placeholder="Press banca, espalda, superseries..."
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
        <select
          className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
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
          className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
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

      <div className="grid max-h-80 gap-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4">
        {exercises.length === 0 ? (
          <p className="text-xs text-[#51607c]">No se encontraron ejercicios con los filtros actuales.</p>
        ) : (
          exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-100 bg-white/80 px-4 py-3 text-sm text-[#4b5a72] shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-col">
                  <p className="font-semibold text-[#0a2e5c]">{exercise.name}</p>
                  <p className="text-xs text-[#51607c]">
                    {exercise.sets}x {exercise.repRange} - {exercise.rest} descanso
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/exercises/${exercise.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-[rgba(10,46,92,0.2)] px-2 py-0.5 text-xs font-semibold text-[#0a2e5c] transition hover:-translate-y-0.5 hover:shadow"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ver ficha
                  </Link>
                  <button
                    type="button"
                    onClick={() => onSelect(exercise)}
                    className="rounded-full border border-[rgba(10,46,92,0.28)] px-3 py-1 text-xs font-semibold text-[#0a2e5c] transition hover:-translate-y-0.5 hover:shadow"
                  >
                    Anadir
                  </button>
                </div>
              </div>
              <p className="text-xs text-[#51607c]">{exercise.description}</p>
              <div className="flex flex-wrap gap-2 text-[0.65rem] text-[#51607c]">
                {exercise.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-zinc-200 px-2 py-0.5">
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
