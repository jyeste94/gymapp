import type {
  Equipment,
  Exercise,
  MuscleGroup,
  RoutineTemplate,
  RoutineTemplate as AppRoutineTemplate,
} from "@/lib/types";
import { auth } from "@/lib/firebase/config";

export type NutriFlowFoodSummary = {
  id: string;
  name: string;
  brand?: string | null;
  barcode?: string | null;
};

export type NutriFlowServing = {
  id?: string;
  description: string;
  metric_amount: number;
  metric_unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type NutriFlowFoodDetail = NutriFlowFoodSummary & {
  servings: NutriFlowServing[];
  best_serving?: NutriFlowServing;
};

export type NutriFlowApiExercise = {
  id: string;
  name: string;
  muscleGroup?: string | null;
  equipment?: string | null;
  description?: string | null;
  gifUrl?: string | null;
  videoUrl?: string | null;
};

export type NutriFlowApiRoutineExercise = {
  id: string;
  exercise: {
    id: string;
    name: string;
    muscleGroup?: string | null;
  };
  sets: number;
  reps: number;
  restSeconds: number;
  orderIndex?: number;
};

export type NutriFlowApiRoutine = {
  id: string;
  name: string;
  daysOfWeek?: Array<number | string>;
  exercises: NutriFlowApiRoutineExercise[];
};

export type NutriFlowCreateRoutineInput = {
  name: string;
  daysOfWeek?: Array<number | string>;
  exercises?: Array<{
    exercise_id: string;
    sets: number;
    reps: number;
    restSeconds: number;
  }>;
};

export type NutriFlowWorkoutSet = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  muscle_group: string | null;
  weight: number;
  reps: number;
  completed: boolean;
};

export type NutriFlowWorkoutSession = {
  id: string;
  routine_id?: string | null;
  routine_name?: string | null;
  date: string;
  duration_minutes?: number | null;
  total_volume: number;
  exercise_count: number;
  set_count: number;
  sets?: NutriFlowWorkoutSet[];
};

export type NutriFlowMeasurement = {
  id: string;
  date: string;
  weight_kg: number;
  body_fat_pct?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  arm_cm?: number | null;
  thigh_cm?: number | null;
  calf_cm?: number | null;
  notes?: string | null;
};

const RAW_BASE_URL = process.env.NEXT_PUBLIC_NUTRIFLOW_API_URL || "https://nutriflow.joseyeste.com";
const BASE_URL = RAW_BASE_URL.replace(/\/$/, "").endsWith("/v1")
  ? RAW_BASE_URL.replace(/\/$/, "")
  : `${RAW_BASE_URL.replace(/\/$/, "")}/v1`;

const DAY_LABELS: Record<string, string> = {
  "1": "Lunes",
  "2": "Martes",
  "3": "Miercoles",
  "4": "Jueves",
  "5": "Viernes",
  "6": "Sabado",
  "7": "Domingo",
  mon: "Lunes",
  tue: "Martes",
  wed: "Miercoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sabado",
  sun: "Domingo",
};
const DAY_TOKEN_PREFIX = "athlos-json:";

type EncodedDayDescriptor = {
  id?: string;
  title?: string;
  focus?: string;
  notes?: string;
  warmup?: string[];
  finisher?: string[];
  count?: number;
};

function safeSplit(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[;,|/]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeMuscle(tag: string): MuscleGroup | null {
  const lower = tag.toLowerCase();
  if (lower.includes("pecho")) return "Pecho";
  if (lower.includes("espalda") || lower.includes("dors")) return "Espalda";
  if (lower.includes("hombro") || lower.includes("delto")) return "Hombro";
  if (lower.includes("biceps")) return "Biceps";
  if (lower.includes("triceps")) return "Triceps";
  if (lower.includes("cuad")) return "Cuadriceps";
  if (lower.includes("isquio") || lower.includes("femoral")) return "Isquios";
  if (lower.includes("glute")) return "Gluteos";
  if (lower.includes("gemel") || lower.includes("pantorr")) return "Gemelos";
  if (lower.includes("core") || lower.includes("abd")) return "Core";
  if (lower.includes("trapec")) return "Trapecio";
  if (lower.includes("antebra")) return "Antebrazo";
  if (lower.includes("oblic")) return "Oblicuos";
  if (lower.includes("cardio")) return "Cardio";
  return null;
}

function normalizeEquipment(tag: string): Equipment | null {
  const lower = tag.toLowerCase();
  if (lower.includes("barra")) return "Barra";
  if (lower.includes("mancuer")) return "Mancuernas";
  if (lower.includes("polea")) return "Polea";
  if (lower.includes("maquina")) return "Maquina";
  if (lower.includes("cuerpo") || lower.includes("body") || lower.includes("peso corporal")) {
    return "Peso corporal";
  }
  return null;
}

function toMuscleGroups(raw?: string | null): MuscleGroup[] {
  const parsed = safeSplit(raw)
    .map(normalizeMuscle)
    .filter((item): item is MuscleGroup => Boolean(item));
  return parsed.length > 0 ? parsed : ["Core"];
}

function toEquipment(raw?: string | null): Equipment[] {
  const parsed = safeSplit(raw)
    .map(normalizeEquipment)
    .filter((item): item is Equipment => Boolean(item));
  return parsed.length > 0 ? parsed : ["Ninguno"];
}

async function getAuthToken(): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No hay usuario autenticado en Firebase");
  }
  return currentUser.getIdToken();
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `NutriFlow request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      message = payload.error || payload.message || message;
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

function normalizeServing(serving: Record<string, unknown>): NutriFlowServing {
  const description = String(serving.description ?? "Porcion");
  const calories = Number(serving.calories ?? 0);
  const proteins = Number(serving.protein_g ?? serving.proteins ?? 0);
  const carbs = Number(serving.carbs_g ?? serving.carbs ?? 0);
  const fats = Number(serving.fat_g ?? serving.fats ?? 0);

  return {
    id: typeof serving.id === "string" ? serving.id : undefined,
    description,
    metric_amount: Number(serving.metric_amount ?? 1),
    metric_unit: String(serving.metric_unit ?? "porcion"),
    calories,
    protein_g: proteins,
    carbs_g: carbs,
    fat_g: fats,
  };
}

export function mapApiExerciseToExercise(exercise: NutriFlowApiExercise): Exercise {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description || "Ejercicio desde NutriFlow",
    muscleGroup: toMuscleGroups(exercise.muscleGroup),
    equipment: toEquipment(exercise.equipment),
    technique: [],
    image: exercise.gifUrl || undefined,
    video: exercise.videoUrl || undefined,
  };
}

function toRoutineDayTitle(dayRef: number | string, index: number): string {
  const key = String(dayRef).toLowerCase();
  return DAY_LABELS[key] || `Dia ${index + 1}`;
}

function decodeDayDescriptor(dayRef: number | string): EncodedDayDescriptor | null {
  if (typeof dayRef !== "string" || !dayRef.startsWith(DAY_TOKEN_PREFIX)) {
    return null;
  }

  try {
    const encoded = dayRef.slice(DAY_TOKEN_PREFIX.length);
    const parsed = JSON.parse(decodeURIComponent(encoded)) as EncodedDayDescriptor;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function mapRoutineExercise(
  entry: NutriFlowApiRoutineExercise,
  exercisesById: Map<string, NutriFlowApiExercise>,
): AppRoutineTemplate["days"][number]["exercises"][number] {
  const fullExercise = exercisesById.get(entry.exercise.id);
  const mappedFull = fullExercise ? mapApiExerciseToExercise(fullExercise) : undefined;

  return {
    id: entry.exercise.id,
    sets: entry.sets ?? 3,
    repRange: String(entry.reps ?? 10),
    rest: `${entry.restSeconds ?? 60} s`,
    tip: "",
    name: mappedFull?.name || entry.exercise.name,
    description: mappedFull?.description || "",
    muscleGroup: mappedFull?.muscleGroup || toMuscleGroups(entry.exercise.muscleGroup),
    equipment: mappedFull?.equipment || ["Ninguno"],
    technique: mappedFull?.technique || [],
    image: mappedFull?.image,
    video: mappedFull?.video,
  } as unknown as AppRoutineTemplate["days"][number]["exercises"][number];
}

export function mapApiRoutineToTemplate(
  routine: NutriFlowApiRoutine,
  exercisesById: Map<string, NutriFlowApiExercise>,
): AppRoutineTemplate {
  const dayRefs = routine.daysOfWeek && routine.daysOfWeek.length > 0 ? routine.daysOfWeek : [1];
  const mappedExercises = [...routine.exercises]
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map((entry) => mapRoutineExercise(entry, exercisesById));

  const equipmentSet = new Set<Equipment>();
  mappedExercises.forEach((exercise) => {
    const maybeEquipment = (exercise as unknown as { equipment?: Equipment[] }).equipment;
    (maybeEquipment ?? []).forEach((item) => equipmentSet.add(item));
  });

  const decodedDays = dayRefs.map(decodeDayDescriptor);
  const hasStructuredDays = decodedDays.length > 0 && decodedDays.every((day) => day !== null);

  let days: AppRoutineTemplate["days"];
  if (hasStructuredDays) {
    let cursor = 0;
    days = decodedDays.map((day, index) => {
      const count = Math.max(0, day?.count ?? 0);
      const exercises = mappedExercises.slice(cursor, cursor + count);
      cursor += count;

      return {
        id: day?.id || `${routine.id}-day-${index + 1}`,
        title: day?.title || `Dia ${index + 1}`,
        focus: day?.focus ?? "",
        notes: day?.notes ?? "",
        warmup: day?.warmup ?? [],
        finisher: day?.finisher ?? [],
        exercises,
      };
    });

    if (cursor < mappedExercises.length && days.length > 0) {
      days[days.length - 1].exercises = [...days[days.length - 1].exercises, ...mappedExercises.slice(cursor)];
    }
  } else {
    days = dayRefs.map((dayRef, index) => ({
      id: `${routine.id}-day-${String(dayRef).toLowerCase()}`,
      title: toRoutineDayTitle(dayRef, index),
      focus: "",
      notes: "",
      warmup: [],
      finisher: [],
      exercises: mappedExercises,
    }));
  }

  return {
    id: routine.id,
    title: routine.name,
    description: "Rutina sincronizada con NutriFlow",
    goal: "Progreso",
    level: "Intermedio",
    frequency: `${days.length} dias/semana`,
    equipment: equipmentSet.size > 0 ? Array.from(equipmentSet) : ["Ninguno"],
    days,
  };
}

export class NutriFlowClient {
  static async searchFoods(query: string, page = 0): Promise<NutriFlowFoodSummary[]> {
    const results = await request<Array<Record<string, unknown>>>(
      `/foods/search?q=${encodeURIComponent(query)}&page=${page}`,
      { method: "GET" },
    );

    return results.map((item) => ({
      id: String(item.id),
      name: String(item.name ?? "Alimento"),
      brand: item.brand ? String(item.brand) : null,
      barcode: item.barcode ? String(item.barcode) : null,
    }));
  }

  static async getFoodDetails(id: string): Promise<NutriFlowFoodDetail> {
    const food = await request<Record<string, unknown>>(`/foods/${id}`, { method: "GET" });
    const servingsRaw = Array.isArray(food.servings) ? food.servings : [];
    const servings = servingsRaw.map((serving) => normalizeServing(serving as Record<string, unknown>));

    return {
      id: String(food.id ?? id),
      name: String(food.name ?? "Alimento"),
      brand: food.brand ? String(food.brand) : null,
      barcode: food.barcode ? String(food.barcode) : null,
      servings,
      best_serving: servings[0],
    };
  }

  static async listExercises(params?: { muscleGroup?: string; equipment?: string; page?: number; limit?: number }): Promise<NutriFlowApiExercise[]> {
    const query = new URLSearchParams();
    if (params?.muscleGroup) query.set("muscleGroup", params.muscleGroup);
    if (params?.equipment) query.set("equipment", params.equipment);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<NutriFlowApiExercise[]>(`/exercises${qs ? `?${qs}` : ""}`, { method: "GET" });
  }

  static async getExercise(id: string): Promise<NutriFlowApiExercise> {
    return request<NutriFlowApiExercise>(`/exercises/${id}`, { method: "GET" });
  }

  static async searchExercises(query: string, limit = 20): Promise<NutriFlowApiExercise[]> {
    return request<NutriFlowApiExercise[]>(`/exercises/search?q=${encodeURIComponent(query)}&limit=${limit}`, { method: "GET" });
  }

  static async updateRoutine(id: string, data: NutriFlowCreateRoutineInput): Promise<void> {
    await request(`/routines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async listRoutines(): Promise<NutriFlowApiRoutine[]> {
    return request<NutriFlowApiRoutine[]>("/routines", { method: "GET" });
  }

  static async listRoutineTemplates(): Promise<RoutineTemplate[]> {
    const [routines, exercises] = await Promise.all([this.listRoutines(), this.listExercises()]);
    const exercisesById = new Map(exercises.map((item) => [item.id, item]));

    return routines.map((routine) => mapApiRoutineToTemplate(routine, exercisesById));
  }

  static async createRoutine(input: NutriFlowCreateRoutineInput): Promise<{ id: string }> {
    return request<{ id: string }>("/routines", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  static async deleteRoutine(id: string): Promise<void> {
    await request(`/routines/${id}`, { method: "DELETE" });
  }

  static async startWorkoutSession(routineId?: string): Promise<{ id: string }> {
    return request<{ id: string }>("/workouts", {
      method: "POST",
      body: JSON.stringify(routineId ? { routine_id: routineId } : {}),
    });
  }

  static async logWorkoutSet(
    sessionId: string,
    payload: { exercise_id: string; reps: number; weight: number },
  ): Promise<{ setId: string }> {
    return request<{ setId: string }>(`/workouts/${sessionId}/sets`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async listWorkoutSessions(params?: { include_sets?: boolean; page?: number; limit?: number }): Promise<NutriFlowWorkoutSession[]> {
    const query = new URLSearchParams();
    if (params?.include_sets) query.set("include_sets", "1");
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<NutriFlowWorkoutSession[]>(`/workouts${qs ? `?${qs}` : ""}`, { method: "GET" });
  }

  static async getWorkoutSession(id: string): Promise<NutriFlowWorkoutSession> {
    return request<NutriFlowWorkoutSession>(`/workouts/${id}`, { method: "GET" });
  }

  static async updateWorkoutSession(id: string, data: { duration_minutes?: number }): Promise<void> {
    await request(`/workouts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteWorkoutSession(id: string): Promise<void> {
    await request(`/workouts/${id}`, { method: "DELETE" });
  }

  static async listMeasurements(params?: { page?: number; limit?: number }): Promise<NutriFlowMeasurement[]> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    const qs = query.toString();
    return request<NutriFlowMeasurement[]>(`/measurements${qs ? `?${qs}` : ""}`, { method: "GET" });
  }

  static async createMeasurement(data: {
    date?: string; weight_kg: number; body_fat_pct?: number;
    chest_cm?: number; waist_cm?: number; hips_cm?: number;
    arm_cm?: number; thigh_cm?: number; calf_cm?: number;
    notes?: string;
  }): Promise<{ id: string }> {
    return request<{ id: string }>("/measurements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateMeasurement(id: string, data: Partial<{
    date: string; weight_kg: number; body_fat_pct: number | null;
    chest_cm: number | null; waist_cm: number | null; hips_cm: number | null;
    arm_cm: number | null; thigh_cm: number | null; calf_cm: number | null;
    notes: string;
  }>): Promise<void> {
    await request(`/measurements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async deleteMeasurement(id: string): Promise<void> {
    await request(`/measurements/${id}`, { method: "DELETE" });
  }

  static async getRoutine(id: string): Promise<NutriFlowApiRoutine> {
    return request<NutriFlowApiRoutine>(`/routines/${id}`, { method: "GET" });
  }

  static async getDiary(date: string): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>(`/diaries/${date}`, { method: "GET" });
  }

  static async addDiaryEntry(
    date: string,
    payload: { serving_id: string; mealType: string; multiplier: number },
  ): Promise<{ entryId: string }> {
    return request<{ entryId: string }>(`/diaries/${date}/entries`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async deleteDiaryEntry(entryId: string): Promise<void> {
    await request(`/diaries/entries/${entryId}`, { method: "DELETE" });
  }
}
