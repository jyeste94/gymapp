import type { Routine, RoutineTemplate } from '@/lib/types';
import { buildRoutine } from '@/lib/routine-builder';
import { defaultExercises } from '@/lib/data/exercises';

// ==========================================================================================
// --- PLANTILLAS DE RUTINAS (DATOS CRUDOS)
// ==========================================================================================

const PUSH_PULL_LEGS_ROUTINE: RoutineTemplate = {
    id: 'push-pull-legs-4d',
    title: 'Push Pull Legs 4 dias',
    description: 'Rotación de 4 días enfocada en hipertrofia y fuerza intermedia. Divide el cuerpo en patrones de movimiento.',
    goal: 'Hipertrofia y fuerza intermedia',
    level: 'Intermedio',
    durationWeeks: 8,
    frequency: '4 dias',
    equipment: ['Barra', 'Mancuernas', 'Polea'],
    days: [
        {
            id: 'push_a',
            title: 'Dia 1 - Push',
            focus: 'Pecho, hombro y triceps',
            notes: 'Enfocate en los basicos compuestos al inicio y termina con aislamientos controlados.',
            warmup: [
                'Remo ligero 5 min',
                'Movilidad hombros',
                'Series de aproximacion en press banca',
            ],
            finisher: ['Flexiones tempo 2x max', 'Face pull con goma'],
            exercises: [
                { id: 'press_banca', sets: 4, repRange: '6-8', rest: '2-3 min', tip: 'Mantiene escapulas retraidas y un tempo controlado.' },
                { id: 'press_inclinado', sets: 3, repRange: '8-10', rest: '90 s', tip: 'Controla el descenso y junta las mancuernas arriba sin golpear.' },
                { id: 'press_militar', sets: 4, repRange: '6-8', rest: '2-3 min', tip: 'Bloquea gluteos y abdomen para proteger la zona lumbar.' },
                { id: 'elevaciones_laterales', sets: 3, repRange: '12-15', rest: '60-90 s', tip: 'Eleva hasta la linea del hombro sin balanceos.' },
                { id: 'fondos_paralelas', sets: 3, repRange: '8-12', rest: '90 s', tip: 'Inclina el torso levemente para activar mas pecho.' },
                { id: 'triceps_cuerda', sets: 3, repRange: '12-15', rest: '60 s', tip: 'Separa la cuerda al final del recorrido para mayor contraccion.' },
            ],
        },
        {
            id: 'pull_a',
            title: 'Dia 2 - Pull',
            focus: 'Espalda, biceps y trapecio',
            notes: 'Prioriza la tecnica y control en cada tiron.',
            warmup: [
                'Assault bike 5 min',
                'Movilidad dorsal',
                'Series progresivas de dominadas',
            ],
            exercises: [
                { id: 'dominadas', sets: 4, repRange: '6-8', rest: '2-3 min', tip: 'Barbilla sobre la barra en cada repeticion.' },
                { id: 'remo_barra', sets: 4, repRange: '8-10', rest: '2-3 min', tip: 'Tronco inclinado y barra pegada al abdomen.' },
                { id: 'remo_mancuerna', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Tira hacia la cadera para activar dorsal.' },
                { id: 'facepull', sets: 3, repRange: '12-15', rest: '60-90 s', tip: 'Codos altos a la altura de los hombros.' },
                { id: 'curl_barra', sets: 3, repRange: '8-10', rest: '90 s', tip: 'Evita balanceos y controla el tempo.' },
                { id: 'curl_inclinado', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Deja caer los brazos verticales para mayor estiramiento.' },
            ],
        },
        {
            id: 'legs_a',
            title: 'Dia 3 - Pierna anterior',
            focus: 'Cuadriceps y core',
            notes: 'Tempos controlados y trabajo de core entre series.',
            warmup: [
                'Bici 5 min',
                'Movilidad cadera',
                'Air squats 2x15',
            ],
            exercises: [
                { id: 'sentadilla_trasera', sets: 4, repRange: '6-8', rest: '2-3 min', tip: 'Profundidad al paralelo manteniendo columna neutra.' },
                { id: 'prensa', sets: 4, repRange: '8-10', rest: '2 min', tip: 'Evita bloquear rodillas al extender.' },
                { id: 'zancadas', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Paso largo con torso vertical.' },
                { id: 'peso_muerto_rumano', sets: 3, repRange: '8-10', rest: '2 min', tip: 'Barra pegada al cuerpo con flexion minima de rodilla.' },
                { id: 'gemelos', sets: 4, repRange: '12-15', rest: '60-90 s', tip: 'Pausa arriba y abajo para controlar la tension.' },
                { id: 'core_combo', sets: 3, repRange: '30-45 s / 8-12', rest: '60 s', tip: 'Control respiracion y evita arquear la zona lumbar.' },
            ],
        },
        {
            id: 'legs_pull',
            title: 'Dia 4 - Pierna posterior',
            focus: 'Isquios, espalda y core',
            notes: 'Controla la tecnica en peso muerto y equilibra volumen de traccion.',
            warmup: [
                'Cinta inclinada 5 min',
                'Good mornings ligeros',
                'Bird dog x lado',
            ],
            finisher: ['Crunch en polea', 'Pallof press'],
            exercises: [
                { id: 'peso_muerto_conv', sets: 4, repRange: '5-6', rest: '3 min', tip: 'Mantiene barra pegada y espalda neutra.' },
                { id: 'dominada_supina', sets: 4, repRange: '8-10', rest: '2-3 min', tip: 'Cierra codos y aprieta dorsales arriba.' },
                { id: 'remo_polea', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Tira hacia el ombligo y contrae escapulas.' },
                { id: 'curl_femoral', sets: 4, repRange: '10-12', rest: '90 s', tip: 'Controla la bajada y pausa 1 segundo arriba.' },
                { id: 'curl_martillo', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Agarre neutro y codos fijos.' },
                { id: 'core_polea', sets: 3, repRange: '12-15', rest: '60 s', tip: 'Flexiona desde el torso manteniendo cadera estable.' },
            ],
        },
    ],
};

const UPPER_LOWER_ROUTINE: RoutineTemplate = {
    id: 'torso-pierna-4d',
    title: 'Torso / Pierna (4 dias)',
    description: 'Frecuencia 2 para torso y pierna. Ideal para progresar en básicos y equilibrar el físico.',
    goal: 'Hipertrofia y Estetica',
    level: 'Intermedio',
    durationWeeks: 8,
    frequency: '4 dias',
    equipment: ['Barra', 'Mancuernas', 'Polea', 'Maquina'],
    days: [
        {
            id: 'torso_a',
            title: 'Dia 1 - Empuje A',
            focus: 'Pecho, Hombro, Triceps, Cuadriceps',
            notes: 'Enfasis en patrones de empuje y pierna anterior.',
            warmup: ['Movilidad hombros', 'Sentadilla peso corporal'],
            exercises: [
                { id: 'sentadilla_trasera', sets: 3, repRange: '8-10', rest: '2-3 min', tip: 'Profundidad al paralelo.' },
                { id: 'press_banca', sets: 3, repRange: '8-10', rest: '2-3 min', tip: 'Controla la excentrica.' },
                { id: 'press_militar', sets: 3, repRange: '10-12', rest: '2 min', tip: 'Sin arquear espalda.' },
                { id: 'extension_cuadriceps', sets: 3, repRange: '12-15', rest: '90 s', tip: 'Aprieta arriba 1s.' },
                { id: 'elevaciones_laterales', sets: 3, repRange: '15-20', rest: '60 s', tip: 'Codos un poco flexionados.' },
                { id: 'triceps_polea', sets: 3, repRange: '12-15', rest: '60 s', tip: 'Extension completa.' },
            ],
        },
        {
            id: 'pierna_a',
            title: 'Dia 2 - Tiron A',
            focus: 'Espalda, Femoral, Biceps',
            notes: 'Enfasis en cadena posterior y tracciones.',
            warmup: ['Movilidad cadera', 'Remo ligero'],
            exercises: [
                { id: 'peso_muerto_rumano', sets: 3, repRange: '10-12', rest: '2 min', tip: 'Bisagra de cadera pura.' },
                { id: 'jalon_al_pecho', sets: 3, repRange: '8-10', rest: '2 min', tip: 'Lleva la barra a la clavicula.' },
                { id: 'remo_mancuerna', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Evita rotar el torso.' },
                { id: 'curl_femoral', sets: 3, repRange: '12-15', rest: '90 s', tip: 'Controla el retorno.' },
                { id: 'facepull', sets: 3, repRange: '15-20', rest: '60 s', tip: 'Tira hacia la frente.' },
                { id: 'curl_mancuerna', sets: 3, repRange: '12-15', rest: '60 s', tip: 'Supina al subir.' },
            ],
        },
        {
            id: 'torso_b',
            title: 'Dia 3 - Empuje B',
            focus: 'Pierna, Pecho, Hombro',
            notes: 'Volumen mas alto en accesorios.',
            warmup: ['Bici 5 min', 'Aproximacion prensa'],
            exercises: [
                { id: 'prensa', sets: 3, repRange: '12', rest: '2 min', tip: 'No bloquees rodillas.' },
                { id: 'press_inclinado', sets: 3, repRange: '10-12', rest: '90 s', tip: 'Enfasis clavicular.' },
                { id: 'aperturas_maquina', sets: 3, repRange: '15', rest: '60 s', tip: 'Estira bien el pectoral.' },
                { id: 'zancadas', sets: 3, repRange: '10/pierna', rest: '90 s', tip: 'Torso vertical.' },
                { id: 'press_frances', sets: 3, repRange: '12', rest: '90 s', tip: 'Codos cerrados.' },
            ],
        },
        {
            id: 'pierna_b',
            title: 'Dia 4 - Tiron B',
            focus: 'Fuerza y Espalda',
            notes: 'Dia de fuerza en peso muerto.',
            warmup: ['Movilidad general', 'Series ramp up peso muerto'],
            exercises: [
                { id: 'peso_muerto_conv', sets: 3, repRange: '6-8', rest: '3 min', tip: 'Tecnica perfecta es prioridad.' },
                { id: 'remo_barra', sets: 3, repRange: '8-10', rest: '2 min', tip: 'Torso paralelo al suelo si puedes.' },
                { id: 'pullover_polea', sets: 3, repRange: '15', rest: '60 s', tip: 'Siente el estiramiento dorsal.' },
                { id: 'curl_martillo', sets: 3, repRange: '12', rest: '60 s', tip: 'Codos fijos.' },
                { id: 'encogimientos_hombro', sets: 3, repRange: '15', rest: '60 s', tip: 'Pausa arriba 1s.' },
            ],
        },
    ],
};


// ==========================================================================================
// --- CONSTRUCCION Y EXPORTACION DE RUTINAS
// ==========================================================================================

const allTemplates: RoutineTemplate[] = [
    PUSH_PULL_LEGS_ROUTINE,
    UPPER_LOWER_ROUTINE,
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
