import { pushPullLegsRoutine, upperLowerRoutine } from "@/lib/data/routine-plan";
import type { RoutineExercise, RoutineExerciseConfig } from "@/lib/data/routine-plan";
import { defaultExercises } from "@/lib/data/exercises";

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

const hydrateExercise = (entry: RoutineExercise | RoutineExerciseConfig): RoutineExercise => {
  // Check if it's already a full RoutineExercise (has 'name' and 'muscleGroup')
  if ("name" in entry && "muscleGroup" in entry) {
    return entry as RoutineExercise;
  }

  // Otherwise it's a Config, look it up
  const base = defaultExercises.find(e => e.id === entry.id);
  if (!base) {
    // Fallback if not found (should not happen for default routines)
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

export const defaultRoutines: RoutineDefinition[] = [
  {
    id: "ppl-4d",
    title: pushPullLegsRoutine.name,
    description: pushPullLegsRoutine.goal,
    focus: pushPullLegsRoutine.goal,
    level: pushPullLegsRoutine.level,
    frequency: pushPullLegsRoutine.frequency,
    equipment: pushPullLegsRoutine.equipment,
    days: pushPullLegsRoutine.days.map((day, index) =>
      normalizeDay(
        {
          id: day.id,
          title: day.name,
          focus: day.focus,
          order: index + 1,
          intensity: day.intensity,
          estimatedDuration: day.estimatedDuration,
          notes: day.notes,
          warmup: day.warmup,
          finisher: day.finisher,
          exercises: day.exercises,
        },
        index,
      ),
    ),
  },
  {
    id: "upper-lower-4d",
    title: upperLowerRoutine.name,
    description: upperLowerRoutine.goal,
    focus: upperLowerRoutine.goal,
    level: upperLowerRoutine.level,
    frequency: upperLowerRoutine.frequency,
    equipment: upperLowerRoutine.equipment,
    days: upperLowerRoutine.days.map((day, index) =>
      normalizeDay(
        {
          id: day.id,
          title: day.name,
          focus: day.focus,
          order: index + 1,
          intensity: day.intensity,
          estimatedDuration: day.estimatedDuration,
          notes: day.notes,
          warmup: day.warmup,
          finisher: day.finisher,
          exercises: day.exercises,
        },
        index,
      ),
    ),
  },
];

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
