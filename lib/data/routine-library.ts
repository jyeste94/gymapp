import type { Routine, RoutineTemplate } from '@/lib/types';
import { buildRoutine } from '@/lib/routine-builder';
import { defaultExercises } from '@/lib/data/exercises';

// ==========================================================================================
// --- PLANTILLAS DE RUTINAS (DATOS CRUDOS)
// ==========================================================================================

const RUTINA_PRINCIPAL: RoutineTemplate = {
    id: 'rutina-principal-4d',
    title: 'Rutina Principal (4 Días)',
    description: 'Rutina dividida en Empuje/Tirón (Torso/Pierna modificado) para fuerza e hipertrofia.',
    goal: 'Hipertrofia y Fuerza',
    level: 'Intermedio',
    durationWeeks: 12,
    frequency: '4 dias',
    equipment: ['Barra', 'Mancuernas', 'Polea', 'Maquina'],
    days: [
        // LUNES (Empuje A)
        {
            id: 'lunes_empuje_a',
            title: 'LUNES (Empuje A)',
            focus: 'Pecho, Hombro, Triceps, Cuadriceps',
            exercises: [
                { id: 'sentadilla_trasera', sets: 4, repRange: '5', rest: '2-3 min', tip: 'Sentadilla Barra' },
                { id: 'press_banca', sets: 4, repRange: '5', rest: '2-3 min', tip: 'Press de Banca' },
                { id: 'press_militar', sets: 3, repRange: '6', rest: '2 min', tip: 'Press Militar' },
                { id: 'fondos_paralelas', sets: 3, repRange: '8-10', rest: '90 s', tip: 'Fondos Paralelas' },
                { id: 'elevaciones_laterales', sets: 3, repRange: '12-15', rest: '60 s', tip: 'Elev. Laterales' },
                { id: 'core_combo', sets: 3, repRange: '10-12', rest: '60 s', tip: 'Ab Wheel / Core' },                
            ],
        },
        // MARTES (Tirón A)
        {
            id: 'martes_tiron_a',
            title: 'MARTES (Tirón A)',
            focus: 'Espalda, Femoral, Biceps',
            exercises: [
                { id: 'peso_muerto_conv', sets: 4, repRange: '3-5', rest: '3 min', tip: 'Peso Muerto (Pesado)' },
                { id: 'dominadas', sets: 4, repRange: '6-8', rest: '2-3 min', tip: 'Dominadas / Jalón' },
                { id: 'remo_barra', sets: 3, repRange: '8', rest: '2 min', tip: 'Remo con Barra' },
                { id: 'pajaros_mancuerna', sets: 3, repRange: '12-20', rest: '60 s', tip: 'Pájaros con mancuernas' },
                { id: 'curl_barra', sets: 3, repRange: '8-10', rest: '90 s', tip: 'Curl Bíceps Barra' },
                { id: 'gemelos', sets: 3, repRange: '12-15', rest: '60 s', tip: 'Gemelos' },
            ],
        },
        // MIÉRCOLES (Descanso) - No se programa día de descanso explicito en el array de días entrenables generalmente, 
        // pero el usuario lo ve en su calendario

        // JUEVES (Empuje B)
        {
            id: 'jueves_empuje_b',
            title: 'JUEVES (Empuje B)',
            focus: 'Pierna, Pecho, Hombro',
            exercises: [
                { id: 'sentadilla_frontal', sets: 3, repRange: '8-10', rest: '2 min', tip: 'Sentadilla Frontal / hack squat' },
                { id: 'press_inclinado', sets: 3, repRange: '8-10', rest: '2 min', tip: 'Press Incl. Manc.' },
                { id: 'press_hombro_mancuerna', sets: 3, repRange: '10', rest: '90 s', tip: 'Press Milit. Manc.' },
                { id: 'triceps_polea', sets: 3, repRange: '12-15', rest: '60 s', tip: 'Extensión Tríceps polea' },
                { id: 'elevaciones_laterales', sets: 3, repRange: '15-20', rest: '60 s', tip: 'Elev. Lat. (Drop set)' },
                // No Core listed in image for Thursday, presuming none or optional
            ],
        },
        // VIERNES (Tirón B)
        {
            id: 'viernes_tiron_b',
            title: 'VIERNES (Tirón B)',
            focus: 'Espalda, Femoral, Biceps, Agarre',
            exercises: [
                { id: 'peso_muerto_rumano', sets: 3, repRange: '8-10', rest: '2 min', tip: 'Peso Muerto Rumano' },
                { id: 'remo_mancuerna', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Remo Mancuerna' },
                { id: 'jalon_neutro', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Jalón Neutro' },
                { id: 'curl_femoral', sets: 3, repRange: '12-15', rest: '90 s', tip: 'Curl Femoral' },
                { id: 'curl_martillo', sets: 3, repRange: '12', rest: '60 s', tip: 'Curl Martillo' },
                { id: 'paseo_granjero', sets: 4, repRange: '40m', rest: '90 s', tip: 'Farmer Carries' },
            ],
        },
    ],
};

// ==========================================================================================
// --- CONSTRUCCION Y EXPORTACION DE RUTINAS
// ==========================================================================================

const allTemplates: RoutineTemplate[] = [
    RUTINA_PRINCIPAL,
];

/**
 * Array de todas las rutinas por defecto, completamente construidas y listas para usar.
 */
export const defaultRoutines: Routine[] = allTemplates.map(template =>
    buildRoutine(template, defaultExercises)
);

/**
 * Indice para buscar rutinas por su ID rápidamente.
 */
const routinesById = new Map(defaultRoutines.map(r => [r.id, r]));

/**
 * Busca y devuelve una rutina por su identificador.
 * @param id El ID de la rutina a buscar.
 * @returns La rutina completa, o undefined si no se encuentra.
 */
export function getRoutineById(id: string): Routine | undefined {
    return routinesById.get(id);
}
