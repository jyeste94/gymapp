import type { RoutineDefinition } from "@/lib/data/routine-library";
import type { RoutineExercise } from "@/lib/data/routine-plan";

export type ExerciseCatalogEntry = RoutineExercise & {
  routineId: string;
  routineTitle: string;
  routineFocus?: string;
  dayId: string;
  dayTitle: string;
  muscleTags: string[];
  equipmentTags: string[];
  keywords: string;
};

const MUSCLE_TAGS = [
  "Pecho",
  "Espalda",
  "Pierna",
  "Isquios",
  "Gluteos",
  "Hombro",
  "Triceps",
  "Biceps",
  "Core",
  "Abdominales",
  "Cuadriceps",
  "Femoral",
  "Gemelos",
  "Full body",
];

const EQUIPMENT_TAGS = [
  "Barra",
  "Mancuernas",
  "Polea",
  "Maquina",
  "Peso corporal",
  "Kettlebell",
  "Banda",
  "Banco",
  "Superset",
  "Cable",
];

const normalize = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function buildExerciseCatalog(routines: RoutineDefinition[]): ExerciseCatalogEntry[] {
  const seen = new Map<string, ExerciseCatalogEntry>();

  routines.forEach((routine) => {
    routine.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (seen.has(exercise.id)) return;
        const normalizedTags = exercise.tags.map((tag) => tag.trim());

        const muscleTags = MUSCLE_TAGS.filter((candidate) =>
          normalizedTags.some((tag) => normalize(tag).includes(normalize(candidate))),
        );

        const equipmentTags = EQUIPMENT_TAGS.filter((candidate) =>
          normalizedTags.some((tag) => normalize(tag).includes(normalize(candidate))),
        );

        seen.set(exercise.id, {
          ...exercise,
          routineId: routine.id,
          routineTitle: routine.title,
          routineFocus: routine.focus,
          dayId: day.id,
          dayTitle: day.title,
          muscleTags,
          equipmentTags,
          keywords: [
            exercise.name,
            routine.title,
            routine.focus,
            day.title,
            ...exercise.tags,
            exercise.description,
          ]
            .filter(Boolean)
            .map((value) => normalize(String(value)))
            .join(" \u2022 "),
        });
      });
    });
  });

  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}
