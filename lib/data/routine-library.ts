
import type { RoutineExercise, RoutineExerciseConfig } from "@/lib/data/routine-plan";
import { defaultExercises } from "@/lib/data/exercises";

// --- Type Definitions (unchanged) ---
type RoutineDayTemplate = {
  id: string;
  title?: string;
  focus?: string;
  order?: number;
  intensity?: string;
  estimatedDuration?: string;
  notes?: string;
  warmup?: string[];
  finisher?: string[];
  exercises: (RoutineExercise | RoutineExerciseConfig)[];
};

export type RoutineDefinition = {
  id: string;
  title: string;
  description?: string;
  focus?: string;
  level?: string;
  frequency?: string;
  equipment: string[];
  days: RoutineDayDefinition[];
};

export type RoutineDayDefinition = {
  id: string;
  title: string;
  order: number;
  focus?: string;
  intensity?: string;
  estimatedDuration?: string;
  notes?: string;
  warmup: string[];
  finisher: string[];
  exercises: RoutineExercise[];
};

export type RoutineTemplateDoc = {
  id: string;
  title: string;
  description?: string;
  focus?: string;
  level?: string;
  frequency?: string;
  equipment?: string[];
  days: RoutineDayTemplate[];
};

// --- Helper Functions (unchanged) ---
const hydrateExercise = (entry: RoutineExercise | RoutineExerciseConfig): RoutineExercise => {
  if ("name" in entry && "muscleGroup" in entry) {
    return entry as RoutineExercise;
  }
  const base = defaultExercises.find(e => e.id === entry.id);
  if (!base) {
    return {
      ...entry,
      name: "Ejercicio desconocido",
      muscleGroup: [],
      equipment: [],
      description: "",
      technique: [],
    } as RoutineExercise;
  }
  return { ...base, ...entry };
};

const normalizeDay = (day: RoutineDayTemplate, index: number): RoutineDayDefinition => ({
  id: day.id,
  title: day.title ?? `Dia ${index + 1}`,
  order: day.order ?? index + 1,
  focus: day.focus,
  intensity: day.intensity,
  estimatedDuration: day.estimatedDuration,
  notes: day.notes,
  warmup: day.warmup ?? [],
  finisher: day.finisher ?? [],
  exercises: day.exercises.map(hydrateExercise),
});

// --- THE FINAL, CORRECTED NEW Routine Data ---
const newRoutineData = {
    name: "Rutina de Fuerza e Hipertrofia",
    goal: "Foco en la ganancia de fuerza y masa muscular, con dias dedicados a empuje y tiron.",
    level: "Intermedio",
    frequency: "4 dias/semana",
    equipment: ["Barra", "Mancuernas", "Peso corporal", "Polea"],
    days: [
        {
            id: "dia-1-empuje-a",
            name: "LUNES (Empuje A)",
            focus: "Fuerza",
            exercises: [
                { id: "sentadilla_trasera", sets: 4, repRange: "5", rest: "2-3 min", tip: "" },
                { id: "press_banca", sets: 4, repRange: "5", rest: "2-3 min", tip: "" },
                { id: "press_militar", sets: 3, repRange: "6", rest: "2 min", tip: "" },
                { id: "fondos_paralelas", sets: 3, repRange: "8-10", rest: "90s", tip: "" },
                { id: "elevaciones_laterales", sets: 3, repRange: "12-15", rest: "60s", tip: "" },
                { id: "core_combo", sets: 3, repRange: "10-12", rest: "60s", tip: "" },
            ] as RoutineExerciseConfig[]
        },
        {
            id: "dia-2-tiron-a",
            name: "MARTES (Tirón A)",
            focus: "Fuerza",
            exercises: [
                { id: "peso_muerto_conv", sets: 4, repRange: "3-5", rest: "3 min", tip: "" },
                { id: "dominadas", sets: 4, repRange: "6-8", rest: "2-3 min", tip: "" },
                { id: "remo_barra", sets: 3, repRange: "8", rest: "2 min", tip: "" },
                { id: "facepull", sets: 3, repRange: "12-20", rest: "60s", tip: "" },
                { id: "curl_barra", sets: 3, repRange: "8-10", rest: "90s", tip: "" },
                { id: "gemelos", sets: 3, repRange: "12-15", rest: "60s", tip: "" },
            ] as RoutineExerciseConfig[]
        },
        {
            id: "dia-3-descanso",
            name: "MIÉRCOLES",
            focus: "Descanso",
            exercises: [] as RoutineExerciseConfig[]
        },
        {
            id: "dia-4-empuje-b",
            name: "JUEVES (Empuje B)",
            focus: "Hipertrofia",
            exercises: [
                { id: "sentadilla_trasera", sets: 3, repRange: "8-10", rest: "90s", tip: "" },
                { id: "press_inclinado", sets: 3, repRange: "8-10", rest: "90s", tip: "" },
                { id: "press_militar", sets: 3, repRange: "10", rest: "90s", tip: "" },
                { id: "triceps_polea", sets: 3, repRange: "12-15", rest: "60s", tip: "" },
                { id: "elevaciones_laterales", sets: 3, repRange: "15-20", rest: "60s", tip: "" },
            ] as RoutineExerciseConfig[]
        },
        {
            id: "dia-5-tiron-b",
            name: "VIERNES (Tirón B)",
            focus: "Hipertrofia",
            exercises: [
                { id: "peso_muerto_rumano", sets: 3, repRange: "8-10", rest: "90s", tip: "" },
                { id: "remo_mancuerna", sets: 3, repRange: "10-12", rest: "90s", tip: "" },
                { id: "jalon_al_pecho", sets: 3, repRange: "10-12", rest: "90s", tip: "" },
                { id: "curl_femoral", sets: 3, repRange: "12-15", rest: "60s", tip: "" },
                { id: "curl_martillo", sets: 3, repRange: "12", rest: "60s", tip: "" },
                { id: "encogimientos_hombro", sets: 4, repRange: "40m", rest: "60s", tip: "" },
            ] as RoutineExerciseConfig[]
        }
    ]
};

// --- Updated defaultRoutines ---
export const defaultRoutines: RoutineDefinition[] = [
  {
    id: "fuerza-hipertrofia-4d",
    title: newRoutineData.name,
    description: newRoutineData.goal,
    focus: newRoutineData.goal,
    level: newRoutineData.level,
    frequency: newRoutineData.frequency,
    equipment: newRoutineData.equipment,
    days: newRoutineData.days.map((day, index) =>
      normalizeDay(
        {
          id: day.id,
          title: day.name,
          focus: day.focus,
          order: index + 1,
          exercises: day.exercises,
        },
        index,
      ),
    ),
  },
];

// --- Other Exported Functions (unchanged) ---
export const templateToRoutineDefinition = (template: RoutineTemplateDoc): RoutineDefinition => ({
  id: template.id,
  title: template.title,
  description: template.description,
  focus: template.focus,
  level: template.level,
  frequency: template.frequency,
  equipment: template.equipment ?? [],
  days: template.days.map(normalizeDay),
});

export const mergeRoutines = (
  custom: RoutineDefinition[],
  defaults: RoutineDefinition[] = defaultRoutines,
) => {
  const ordered: RoutineDefinition[] = [...custom];
  const seen = new Set(custom.map((routine) => routine.id));
  for (const routine of defaults) {
    if (!seen.has(routine.id)) {
      ordered.push(routine);
    }
  }
  return ordered;
};

export const createRoutineAliasIndex = (routines: RoutineDefinition[]) => {
  type Entry = { routine: RoutineDefinition; day?: RoutineDayDefinition };
  const map = new Map<string, Entry>();
  const push = (key: string, entry: Entry) => {
    const normalized = key.trim().toLowerCase();
    if (!normalized) return;
    if (!map.has(normalized)) {
      map.set(normalized, entry);
    }
  };
  routines.forEach((routine) => {
    push(routine.id, { routine });
    push(routine.title, { routine });
    routine.days.forEach((day) => {
      push(day.id, { routine, day });
      push(day.title, { routine, day });
    });
  });
  return map;
};

export const resolveRoutine = (
  identifier?: string | null,
  routines: RoutineDefinition[] = defaultRoutines,
): RoutineDefinition | undefined => {
  if (!identifier) return undefined;
  const index = createRoutineAliasIndex(routines);
  return index.get(identifier.trim().toLowerCase())?.routine;
};

export const resolveRoutineDay = (
  routineId: string,
  dayId: string,
  routines: RoutineDefinition[],
): RoutineDayDefinition | undefined => {
  const routine = routines.find((entry) => entry.id === routineId);
  if (!routine) return undefined;
  return routine.days.find((day) => day.id === dayId);
};

type ExerciseContext = {
  routine: RoutineDefinition;
  day: RoutineDayDefinition;
  exercise: RoutineExercise;
};

export const buildExerciseIndex = (routines: RoutineDefinition[]) => {
  const map = new Map<string, ExerciseContext>();
  routines.forEach((routine) => {
    routine.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (!map.has(exercise.id)) {
          map.set(exercise.id, { routine, day, exercise });
        }
      });
    });
  });
  return map;
};
