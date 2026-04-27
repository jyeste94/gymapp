import type {
    Exercise,
    Routine,
    RoutineDay,
    RoutineDayTemplate,
    RoutineExercise,
    RoutineExerciseConfig,
    RoutineTemplate,
} from '@/lib/types';

const unknownExercise: Exercise = {
    id: 'unknown',
    name: 'Ejercicio Desconocido',
    description: 'Este ejercicio no fue encontrado en la biblioteca.',
    muscleGroup: [],
    equipment: [],
    technique: [],
};

function createExerciseIndex(exercises: Exercise[]): Map<string, Exercise> {
    return new Map(exercises.map((ex) => [ex.id, ex]));
}

function resolveExercise(config: RoutineExerciseConfig, exerciseIndex: Map<string, Exercise>): Exercise {
    const extended = config as Record<string, unknown>;
    if (extended.name) {
        return {
            id: config.id,
            name: String(extended.name),
            description: String(extended.description ?? ''),
            muscleGroup: (extended.muscleGroup ?? []) as RoutineExercise['muscleGroup'],
            equipment: (extended.equipment ?? []) as RoutineExercise['equipment'],
            technique: (extended.technique ?? []) as string[],
            image: extended.image as string | undefined,
            video: extended.video as string | undefined,
        };
    }
    return exerciseIndex.get(config.id) ?? unknownExercise;
}

function hydrateExercise(
    config: RoutineExerciseConfig,
    exerciseIndex: Map<string, Exercise>,
): RoutineExercise {
    const baseExercise = resolveExercise(config, exerciseIndex);
    return { ...baseExercise, ...config };
}

function hydrateDay(dayTemplate: RoutineDayTemplate, exerciseIndex: Map<string, Exercise>): RoutineDay {
    return {
        id: dayTemplate.id,
        title: dayTemplate.title,
        focus: dayTemplate.focus,
        notes: dayTemplate.notes,
        warmup: dayTemplate.warmup,
        finisher: dayTemplate.finisher,
        exercises: dayTemplate.exercises.map((config) => hydrateExercise(config, exerciseIndex)),
    };
}

export function buildRoutine(routineTemplate: RoutineTemplate, allExercises?: Exercise[]): Routine {
    const exerciseIndex = allExercises ? createExerciseIndex(allExercises) : new Map();

    const hydratedDays = routineTemplate.days.map((dayTemplate) =>
        hydrateDay(dayTemplate, exerciseIndex)
    );

    return {
        id: routineTemplate.id,
        title: routineTemplate.title,
        description: routineTemplate.description,
        goal: routineTemplate.goal,
        level: routineTemplate.level,
        durationWeeks: routineTemplate.durationWeeks,
        frequency: routineTemplate.frequency,
        equipment: routineTemplate.equipment,
        days: hydratedDays,
    };
}
