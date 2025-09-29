"use client";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { X, Plus, Trash2, Search } from "lucide-react";
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
  focus?: string;
  intensity?: string;
  estimatedDuration?: string;
  notes?: string;
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
  intensity: "Moderado",
  estimatedDuration: "60 min",
  notes: "",
  exercises: [],
});

const buildDefaultState = (): RoutineFormState => ({
  title: "",
  description: "",
  focus: "",
  level: "Intermedio",
  frequency: "",
  equipment: "Barra, Mancuernas",
  days: [createDay(0)],
});

type Props = {
  open: boolean;
  userId?: string | null;
  onClose: () => void;
  onCreated?: () => void;
  exercises: ExerciseCatalogEntry[];
};

export default function CreateRoutineDrawer({ open, userId, exercises, onClose, onCreated }: Props) {
  const [form, setForm] = useState<RoutineFormState>(() => buildDefaultState());
  const [activeDayId, setActiveDayId] = useState<string | null>(form.days[0]?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");

  useEffect(() => {
    if (!open) return;
    const fresh = buildDefaultState();
    setForm(fresh);
    setActiveDayId(fresh.days[0]?.id ?? null);
    setSaving(false);
    setError(null);
    setSearchTerm("");
    setMuscleFilter("");
    setEquipmentFilter("");
  }, [open]);

  useEffect(() => {
    if (activeDayId) return;
    if (form.days.length > 0) {
      setActiveDayId(form.days[0].id);
    }
  }, [activeDayId, form.days]);

  const activeDay = form.days.find((day) => day.id === activeDayId) ?? form.days[0];

  const availableMuscles = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((exercise) => {
      exercise.muscleTags.forEach((tag) => set.add(tag));
    });
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [exercises]);

  const availableEquipment = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((exercise) => {
      exercise.equipmentTags.forEach((tag) => set.add(tag));
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
        const matchesMuscle = exercise.muscleTags.some(
          (tag) => normalize(tag) === normalize(muscleFilter),
        );
        if (!matchesMuscle) return false;
      }
      if (equipmentFilter) {
        const matchesEquipment = exercise.equipmentTags.some(
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
        exercises: [...day.exercises, exercise],
      };
    });
  };

  const removeExerciseFromDay = (dayId: string, exerciseId: string) => {
    updateDay(dayId, (day) => ({
      ...day,
      exercises: day.exercises.filter((exercise) => exercise.id !== exerciseId),
    }));
  };

  const handleAddDay = () => {
    setForm((prev) => ({
      ...prev,
      days: [...prev.days, createDay(prev.days.length)],
    }));
  };

  const handleRemoveDay = (dayId: string) => {
    setForm((prev) => {
      if (prev.days.length <= 1) return prev;
      const nextDays = prev.days.filter((day) => day.id !== dayId);
      const nextState = { ...prev, days: nextDays };
      if (activeDayId === dayId) {
        const fallback = nextDays[0]?.id ?? null;
        setActiveDayId(fallback);
      }
      return nextState;
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
          focus: day.focus?.trim() || undefined,
          order: index + 1,
          intensity: day.intensity?.trim() || undefined,
          estimatedDuration: day.estimatedDuration?.trim() || undefined,
          notes: day.notes?.trim() || undefined,
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
    ? "Inicia sesion para crear tus rutinas personalizadas."
    : !allDaysHaveExercises
    ? "Cada dia debe tener al menos un ejercicio."
    : "Revisa los datos antes de guardar.";

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
              <h2 className="text-lg font-semibold text-zinc-900">Crea tu rutina</h2>
              <p className="text-sm text-[#51607c]">
                Define los dias, asigna ejercicios y guarda tu plan personalizado.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-[#51607c] transition hover:border-zinc-300 hover:text-[#0a2e5c]"
              aria-label="Cerrar creador"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#0a2e5c]">Datos de la rutina</h3>
                <p className="text-xs text-[#51607c]">Estos datos apareceran en la tarjeta de la rutina.</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-xs text-[#51607c]">
                    Nombre de la rutina
                    <input
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                      value={form.title}
                      onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Empuje/Tiron + Pierna"
                    />
                  </label>
                  <label className="space-y-2 text-xs text-[#51607c]">
                    Objetivo / foco
                    <input
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                      value={form.focus}
                      onChange={(event) => setForm((prev) => ({ ...prev, focus: event.target.value }))}
                      placeholder="Hipertrofia intermedia"
                    />
                  </label>
                  <label className="space-y-2 text-xs text-[#51607c]">
                    Nivel
                    <select
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                      value={form.level}
                      onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
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
                      onChange={(event) => setForm((prev) => ({ ...prev, frequency: event.target.value }))}
                      placeholder="4 dias"
                    />
                  </label>
                </div>
                <label className="mt-4 block space-y-2 text-xs text-[#51607c]">
                  Descripcion
                  <textarea
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Describe el objetivo general y recomendaciones."
                  />
                </label>
                <label className="mt-4 block space-y-2 text-xs text-[#51607c]">
                  Material necesario (separado por comas)
                  <input
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                    value={form.equipment}
                    onChange={(event) => setForm((prev) => ({ ...prev, equipment: event.target.value }))}
                    placeholder="Barra, Mancuernas, Polea"
                  />
                </label>
                {equipmentList.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#51607c]">
                    {equipmentList.map((item) => (
                      <span key={item} className="rounded-full border border-[rgba(10,46,92,0.16)] px-2 py-0.5">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0a2e5c]">Dias de entrenamiento</h3>
                    <p className="text-xs text-[#51607c]">
                      Selecciona un dia para asignar ejercicios desde el buscador.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(10,46,92,0.24)] px-3 py-2 text-xs font-semibold text-[#0a2e5c] transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" /> A?adir dia
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  {form.days.map((day) => {
                    const isActive = activeDay?.id === day.id;
                    return (
                      <article
                        key={day.id}
                        className={clsx(
                          "rounded-3xl border px-4 py-4 transition",
                          isActive
                            ? "border-[rgba(10,46,92,0.28)] bg-white shadow-sm"
                            : "border-zinc-200 bg-zinc-50/60",
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-col gap-3 md:flex-row">
                              <label className="flex-1 space-y-2 text-xs text-[#51607c]">
                                Nombre del dia
                                <input
                                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                                  value={day.title}
                                  onChange={(event) =>
                                    updateDay(day.id, (prevDay) => ({ ...prevDay, title: event.target.value }))
                                  }
                                />
                              </label>
                              <label className="flex-1 space-y-2 text-xs text-[#51607c]">
                                Foco del dia
                                <input
                                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                                  value={day.focus ?? ""}
                                  onChange={(event) =>
                                    updateDay(day.id, (prevDay) => ({ ...prevDay, focus: event.target.value }))
                                  }
                                />
                              </label>
                            </div>
                            <div className="flex flex-col gap-3 md:flex-row">
                              <label className="flex-1 space-y-2 text-xs text-[#51607c]">
                                Intensidad
                                <input
                                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                                  value={day.intensity ?? ""}
                                  onChange={(event) =>
                                    updateDay(day.id, (prevDay) => ({ ...prevDay, intensity: event.target.value }))
                                  }
                                />
                              </label>
                              <label className="flex-1 space-y-2 text-xs text-[#51607c]">
                                Duracion estimada
                                <input
                                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                                  value={day.estimatedDuration ?? ""}
                                  onChange={(event) =>
                                    updateDay(day.id, (prevDay) => ({ ...prevDay, estimatedDuration: event.target.value }))
                                  }
                                />
                              </label>
                            </div>
                            <label className="block space-y-2 text-xs text-[#51607c]">
                              Notas del dia
                              <textarea
                                className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                                rows={2}
                                value={day.notes ?? ""}
                                onChange={(event) =>
                                  updateDay(day.id, (prevDay) => ({ ...prevDay, notes: event.target.value }))
                                }
                              />
                            </label>
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <button
                              type="button"
                              onClick={() => setActiveDayId(day.id)}
                              className={clsx(
                                "rounded-full border px-3 py-1 text-xs font-semibold",
                                isActive
                                  ? "border-[#0a2e5c] bg-[#0a2e5c]/10 text-[#0a2e5c]"
                                  : "border-zinc-200 text-[#51607c]",
                              )}
                            >
                              {isActive ? "Destino activo" : "Asignar ejercicios"}
                            </button>
                            {form.days.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveDay(day.id)}
                                className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:bg-red-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Quitar dia
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold text-[#4b5a72]">Ejercicios asignados</p>
                          {day.exercises.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-3 text-xs text-zinc-400">
                              Aun no has a?adido ejercicios. Selecciona este dia y usa el buscador.
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {day.exercises.map((exercise) => (
                                <li
                                  key={exercise.id}
                                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[#4b5a72]"
                                >
                                  <div>
                                    <p className="font-semibold text-zinc-800">{exercise.name}</p>
                                    <p className="text-xs text-[#51607c]">
                                      {exercise.sets}x {exercise.repRange} ? {exercise.rest} descanso
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeExerciseFromDay(day.id, exercise.id)}
                                    className="text-xs font-semibold text-red-500 transition hover:text-red-600"
                                  >
                                    Quitar
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0a2e5c]">Buscador de ejercicios</h3>
                    <p className="text-xs text-[#51607c]">
                      Filtra por nombre, musculo o material y a?ade al dia seleccionado.
                    </p>
                  </div>
                  {activeDay && (
                    <span className="rounded-full border border-[rgba(10,46,92,0.18)] bg-white px-3 py-1 text-xs text-[#4b5a72]">
                      Anadiendo a: <strong className="ml-1 text-[#0a2e5c]">{activeDay.title}</strong>
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 md:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-9 py-2 text-sm"
                      placeholder="Press banca, espalda, superseries..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                    />
                  </div>
                  <select
                    className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                    value={muscleFilter}
                    onChange={(event) => setMuscleFilter(event.target.value)}
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
                    onChange={(event) => setEquipmentFilter(event.target.value)}
                  >
                    <option value="">Material</option>
                    {availableEquipment.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 grid max-h-80 gap-3 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4">
                  {filteredExercises.length === 0 ? (
                    <p className="text-xs text-[#51607c]">No se encontraron ejercicios con los filtros actuales.</p>
                  ) : (
                    filteredExercises.map((exercise) => {
                      const alreadyAdded = activeDay?.exercises.some((item) => item.id === exercise.id);
                      return (
                        <div
                          key={exercise.id}
                          className="flex flex-col gap-2 rounded-2xl border border-zinc-100 bg-white/80 px-4 py-3 text-sm text-[#4b5a72] shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold text-zinc-800">{exercise.name}</p>
                              <p className="text-xs text-[#51607c]">
                                {exercise.sets}x {exercise.repRange} ? {exercise.rest} descanso
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => activeDay && addExerciseToDay(activeDay.id, exercise)}
                              disabled={!activeDay || alreadyAdded}
                              className={clsx(
                                "rounded-full px-3 py-1 text-xs font-semibold transition",
                                alreadyAdded
                                  ? "border border-zinc-200 text-zinc-400"
                                  : "border border-[rgba(10,46,92,0.28)] text-[#0a2e5c] hover:-translate-y-0.5 hover:shadow",
                              )}
                            >
                              {alreadyAdded ? "A?adido" : "A?adir"}
                            </button>
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
                      );
                    })
                  )}
                </div>
              </div>
            </section>
          </div>

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
        </div>
      </aside>
    </div>
  );
}



