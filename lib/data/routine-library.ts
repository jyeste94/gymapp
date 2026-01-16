import type { Routine, RoutineTemplate } from '@/lib/types';
import { buildRoutine } from '@/lib/routine-builder';
import { defaultExercises } from '@/lib/data/exercises';

// ==========================================================================================
// --- PLANTILLAS DE RUTINAS (DATOS CRUDOS)
// ==========================================================================================
// Estas son las definiciones base de las rutinas. Solo contienen la informacion minima
// y usan IDs para referenciar a los ejercicios.

const TEMPLATE_FUERZA_HIPERTROFIA: RoutineTemplate = {
    id: 'fuerza-hipertrofia-4d',
    title: 'Fuerza e Hipertrofia (4 Días)',
    description: 'Rutina enfocada en la ganancia de fuerza y masa muscular, con una división de empuje/tirón y días de frecuencia 2.',
    level: 'Intermedio',
    frequency: '4 días/semana',
    equipment: ['Barra', 'Mancuernas', 'Peso corporal', 'Polea'],
    days: [
        {
            id: 'dia-1-empuje-fuerza',
            title: 'Día 1: Empuje (Fuerza)',
            focus: 'Fuerza',
            exercises: [
                { id: 'sentadilla_trasera', sets: 4, repRange: '4-6', rest: '2-3 min' },
                { id: 'press_banca', sets: 4, repRange: '4-6', rest: '2-3 min' },
                { id: 'press_militar', sets: 3, repRange: '5-8', rest: '2 min' },
                { id: 'fondos_paralelas', sets: 3, repRange: '6-10', rest: '90s', tip: 'Añadir lastre si es necesario' },
                { id: 'elevaciones_laterales', sets: 4, repRange: '10-15', rest: '60s' },
            ],
        },
        {
            id: 'dia-2-tiron-fuerza',
            title: 'Día 2: Tirón (Fuerza)',
            focus: 'Fuerza',
            exercises: [
                { id: 'peso_muerto_conv', sets: 4, repRange: '3-5', rest: '3 min' },
                { id: 'dominadas', sets: 4, repRange: '6-8', rest: '2-3 min', tip: 'Añadir lastre si es necesario' },
                { id: 'remo_barra', sets: 3, repRange: '6-8', rest: '2 min' },
                { id: 'facepull', sets: 3, repRange: '12-15', rest: '60s' },
                { id: 'curl_barra', sets: 4, repRange: '8-10', rest: '90s' },
            ],
        },
        {
            id: 'dia-3-empuje-hipertrofia',
            title: 'Día 3: Empuje (Hipertrofia)',
            focus: 'Hipertrofia',
            exercises: [
                { id: 'press_inclinado', sets: 4, repRange: '8-12', rest: '90s' },
                { id: 'sentadilla_trasera', sets: 4, repRange: '8-10', rest: '90s' },
                { id: 'press_militar', sets: 3, repRange: '8-12', rest: '90s' },
                { id: 'triceps_polea', sets: 3, repRange: '10-15', rest: '60s' },
                { id: 'aperturas_maquina', sets: 3, repRange: '12-15', rest: '60s' },
            ],
        },
        {
            id: 'dia-4-tiron-hipertrofia',
            title: 'Día 4: Tirón (Hipertrofia)',
            focus: 'Hipertrofia',
            exercises: [
                { id: 'peso_muerto_rumano', sets: 4, repRange: '8-12', rest: '90s' },
                { id: 'jalon_al_pecho', sets: 4, repRange: '10-12', rest: '90s' },
                { id: 'remo_mancuerna', sets: 3, repRange: '10-12', rest: '90s' },
                { id: 'curl_femoral', sets: 3, repRange: '12-15', rest: '60s' },
                { id: 'curl_inclinado', sets: 3, repRange: '12-15', rest: '60s' },
            ],
        },
    ],
};

// Agrega aquí más plantillas de rutinas en el futuro...
// const TEMPLATE_OTRA_RUTINA: RoutineTemplate = { ... };


// ==========================================================================================
// --- CONSTRUCCION Y EXPORTACION DE RUTINAS
// ==========================================================================================

const allTemplates: RoutineTemplate[] = [
    TEMPLATE_FUERZA_HIPERTROFIA,
    // Agrega aquí otras plantillas
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
