import type { Routine, RoutineDay, RoutineExercise } from './types';

// ==========================================================================================
// --- TIPOS DE AYUDA
// ==========================================================================================

/**
 * Contexto de un ejercicio: a que rutina y dia pertenece.
 */
export type ExerciseContext = {
  routine: Routine;
  day: RoutineDay;
  exercise: RoutineExercise;
};

/**
 * Entrada para el indice de busqueda de rutinas por alias (ID o titulo).
 */
export type RoutineAliasIndexEntry = {
  routine: Routine;
  day?: RoutineDay;
};


// ==========================================================================================
// --- FUNCIONES DE UTILIDAD
// ==========================================================================================

/**
 * Combina rutinas personalizadas (custom) y por defecto (default).
 * Las rutinas personalizadas tienen prioridad si hay conflictos de ID.
 * @param customRoutines Array de rutinas del usuario.
 * @param defaultRoutines Array de rutinas por defecto de la aplicacion.
 * @returns Un unico array de rutinas combinado.
 */
export function mergeRoutines(customRoutines: Routine[], defaultRoutines: Routine[]): Routine[] {
  const merged = [...customRoutines];
  const customIds = new Set(customRoutines.map(r => r.id));
  
  for (const defaultRoutine of defaultRoutines) {
    if (!customIds.has(defaultRoutine.id)) {
      merged.push(defaultRoutine);
    }
  }
  
  return merged;
}

/**
 * Crea un indice (Map) para buscar ejercicios por su ID.
 * Esto permite un acceso O(1) al contexto completo de un ejercicio (rutina, dia).
 * @param routines El array de rutinas sobre el que construir el indice.
 * @returns Un Map donde la clave es el ID del ejercicio y el valor es su `ExerciseContext`.
 */
export function buildExerciseIndex(routines: Routine[]): Map<string, ExerciseContext> {
  const index = new Map<string, ExerciseContext>();
  
  for (const routine of routines) {
    for (const day of routine.days) {
      for (const exercise of day.exercises) {
        // Solo se añade la primera aparicion de un ejercicio para evitar duplicados.
        if (!index.has(exercise.id)) {
          index.set(exercise.id, { routine, day, exercise });
        }
      }
    }
  }
  
  return index;
}

/**
 * Crea un indice (Map) para buscar rutinas o dias de rutina por diferentes alias (ID o titulo).
 * Normaliza las claves a minusculas para una busqueda insensible a mayusculas.
 * @param routines El array de rutinas sobre el que construir el indice.
 * @returns Un Map donde la clave es un alias y el valor es `RoutineAliasIndexEntry`.
 */
export function createRoutineAliasIndex(routines: Routine[]): Map<string, RoutineAliasIndexEntry> {
  const index = new Map<string, RoutineAliasIndexEntry>();

  const addAlias = (key: string, entry: RoutineAliasIndexEntry) => {
    const normalizedKey = key.trim().toLowerCase();
    if (normalizedKey && !index.has(normalizedKey)) {
      index.set(normalizedKey, entry);
    }
  };

  for (const routine of routines) {
    addAlias(routine.id, { routine });
    addAlias(routine.title, { routine });
    
    for (const day of routine.days) {
      addAlias(day.id, { routine, day });
      addAlias(day.title, { routine, day });
    }
  }

  return index;
}
