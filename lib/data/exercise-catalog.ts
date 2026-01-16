import type { Routine, Exercise } from "@/lib/types";
import { defaultExercises } from "@/lib/data/exercises";

/**
 * Representa una entrada en el catalogo de ejercicios.
 * Es un objeto `Exercise` enriquecido con el contexto de la primera rutina donde aparece.
 */
export type ExerciseCatalogEntry = Exercise & {
  routineId?: string;
  routineTitle?: string;
  routineFocus?: string;
  dayId?: string;
  dayTitle?: string;
  tags: string[];
  keywords: string;
};

/**
 * Normaliza un string: lo convierte a minusculas y elimina los diacriticos.
 * Util para busquedas insensibles a mayusculas y acentos.
 * @param value El string a normalizar.
 */
const normalize = (value: string) => 
  value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/**
 * Construye un catalogo de ejercicios a partir de las rutinas disponibles.
 * Cada ejercicio se enriquece con el contexto de la primera rutina en la que aparece.
 * 
 * @param routines Un array de rutinas completas (`Routine`).
 * @returns Un array de `ExerciseCatalogEntry` ordenado alfabeticamente.
 */
export function buildExerciseCatalog(routines: Routine[]): ExerciseCatalogEntry[] {
  // Mapa para guardar el primer contexto de uso de cada ejercicio (ID -> contexto).
  const usageMap = new Map<string, { routine: Routine; dayTitle: string; dayId: string }>();

  for (const routine of routines) {
    for (const day of routine.days) {
      for (const exercise of day.exercises) {
        if (!usageMap.has(exercise.id)) {
          usageMap.set(exercise.id, { routine, dayTitle: day.title, dayId: day.id });
        }
      }
    }
  }

  // Mapea sobre todos los ejercicios por defecto para construir el catalogo final.
  return defaultExercises.map((exercise) => {
    const usage = usageMap.get(exercise.id);
    const tags = [...exercise.muscleGroup, ...exercise.equipment];

    const keywords = [
      exercise.name,
      usage?.routine.title,
      // El foco de una rutina ya no está en el nivel superior, sino en cada día. 
      // Aquí asumimos el foco del día donde se encontró el ejercicio.
      usage ? usage.routine.days.find(d => d.id === usage.dayId)?.focus : undefined,
      usage?.dayTitle,
      ...tags,
      exercise.description,
    ]
      .filter(Boolean)
      .map((value) => normalize(String(value)))
      .join(" • ");

    return {
      ...exercise,
      routineId: usage?.routine.id,
      routineTitle: usage?.routine.title ?? "General",
      // Asignamos el foco del día específico.
      routineFocus: usage ? usage.routine.days.find(d => d.id === usage.dayId)?.focus : undefined,
      dayId: usage?.dayId,
      dayTitle: usage?.dayTitle,
      tags,
      keywords,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}
