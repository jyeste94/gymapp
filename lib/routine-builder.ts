import type {
    Exercise,
    Routine,
    RoutineDay,
    RoutineDayTemplate,
    RoutineExercise,
    RoutineExerciseConfig,
    RoutineTemplate,
} from '@/lib/types';

/**
 * Un objeto de ejercicio por defecto para usar cuando no se encuentra un ID.
 * Previene que la aplicacion se rompa si una plantilla de rutina hace referencia
 * a un ejercicio que ya no existe.
 */
const unknownExercise: Exercise = {
    id: 'unknown',
    name: 'Ejercicio Desconocido',
    description: 'Este ejercicio no fue encontrado en la biblioteca.',
    muscleGroup: [],
    equipment: [],
    technique: [],
};

/**
 * Crea un indice (Map) de ejercicios a partir de un array para busquedas rapidas.
 * @param exercises Array de todos los ejercicios disponibles.
 * @returns Un Map donde la clave es el ID del ejercicio y el valor es el objeto Exercise.
 */
function createExerciseIndex(exercises: Exercise[]): Map<string, Exercise> {
    return new Map(exercises.map((ex) => [ex.id, ex]));
}

/**
 * Combina la informacion base de un ejercicio con su configuracion en una rutina.
 * @param config La configuracion del ejercicio desde la plantilla (ID, series, etc.).
 * @param exerciseIndex El Map de todos los ejercicios disponibles.
 * @returns Un objeto RoutineExercise completo.
 */
function hydrateExercise(
    config: RoutineExerciseConfig,
    exerciseIndex: Map<string, Exercise>
): RoutineExercise {
    const baseExercise = exerciseIndex.get(config.id) ?? unknownExercise;
    return {
        ...baseExercise,
        ...config,
    };
}

/**
 * Transforma una plantilla de dia (RoutineDayTemplate) en un dia de rutina completo (RoutineDay).
 * @param dayTemplate La plantilla del dia.
 * @param exerciseIndex El Map de todos los ejercicios disponibles.
 * @returns Un objeto RoutineDay completo con ejercicios hidratados.
 */
function hydrateDay(dayTemplate: RoutineDayTemplate, exerciseIndex: Map<string, Exercise>): RoutineDay {
    return {
        id: dayTemplate.id,
        title: dayTemplate.title,
        focus: dayTemplate.focus,
        exercises: dayTemplate.exercises.map((config) => hydrateExercise(config, exerciseIndex)),
    };
}

/**
 * Construye una rutina completa y detallada a partir de una plantilla y una biblioteca de ejercicios.
 * Este es el punto de entrada principal para transformar una definicion de rutina en un objeto
 * utilizable por la aplicacion.
 * 
 * @param routineTemplate La plantilla de la rutina a construir.
 * @param allExercises La lista completa de ejercicios disponibles en la aplicacion.
 * @returns La rutina completa, lista para ser usada en la UI.
 */
export function buildRoutine(routineTemplate: RoutineTemplate, allExercises: Exercise[]): Routine {
    const exerciseIndex = createExerciseIndex(allExercises);
    
    const hydratedDays = routineTemplate.days.map((dayTemplate) => 
        hydrateDay(dayTemplate, exerciseIndex)
    );

    return {
        id: routineTemplate.id,
        title: routineTemplate.title,
        description: routineTemplate.description,
        level: routineTemplate.level,
        frequency: routineTemplate.frequency,
        equipment: routineTemplate.equipment,
        days: hydratedDays,
    };
}
