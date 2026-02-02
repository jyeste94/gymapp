/* eslint-disable */

// ==========================================================================================
// --- ENUMS Y TIPOS BASICOS
// ==========================================================================================

/**
 * Grupos musculares especificos para evitar errores de tipeo.
 */
export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Hombro'
  | 'Biceps'
  | 'Triceps'
  | 'Cuadriceps'
  | 'Isquios'
  | 'Gluteos'
  | 'Gemelos'
  | 'Core'
  | 'Trapecio'
  | 'Antebrazo'
  | 'Oblicuos'
  | 'Cardio';

/**
 * Equipamiento disponible, para consistencia.
 */
export type Equipment =
  | 'Barra'
  | 'Mancuernas'
  | 'Polea'
  | 'Maquina'
  | 'Peso corporal'
  | 'Ninguno';

/**
 * Niveles de dificultad de las rutinas.
 */
export type RoutineLevel = 'Principiante' | 'Intermedio' | 'Avanzado';


// ==========================================================================================
// --- MODELO DE DATOS DE EJERCICIOS
// ==========================================================================================

/**
 * Representa la definicion base de un ejercicio en la biblioteca.
 * Contiene toda la informacion estatica y descriptiva.
 */
export type Exercise = {
  id: string; // Identificador unico, ej: 'press_banca'
  name: string; // Nombre legible, ej: 'Press de Banca'
  description: string;
  muscleGroup: MuscleGroup[];
  equipment: Equipment[];
  technique: string[]; // Array de consejos o pasos para la tecnica
  image?: string; // Opcional: URL o path a una imagen
  video?: string; // Opcional: URL a un video demostrativo
};


// ==========================================================================================
// --- ESTRUCTURA DE PLANTILLAS DE RUTINAS (TEMPLATES)
// ==========================================================================================
// Las plantillas son la "receta" para construir una rutina. Usan IDs para referenciar
// ejercicios y contienen solo la configuracion especifica de la rutina.

/**
 * Configuracion de un ejercicio dentro de una plantilla de rutina.
 * Solo contiene el ID del ejercicio y los parametros de entrenamiento.
 */
export type RoutineExerciseConfig = {
  id: string; // Referencia al Exercise.id
  sets: number;
  repRange: string;
  rest: string;
  tip?: string; // Consejo especifico para este ejercicio en esta rutina
};

/**
 * Plantilla para un dia de entrenamiento.
 */
export type RoutineDayTemplate = {
  id: string; // Identificador del dia, ej: 'dia-1-empuje'
  title: string; // Nombre del dia, ej: 'Dia 1: Empuje (Fuerza)'
  focus?: string; // Foco del dia, ej: 'Fuerza' o 'Hipertrofia'
  notes?: string; // Notas o instrucciones generales para el dia
  warmup?: string[]; // Lista de ejercicios de calentamiento
  finisher?: string[]; // Lista de ejercicios para finalizar
  exercises: RoutineExerciseConfig[]; // Lista de ejercicios configurados
};

/**
 * Plantilla completa de una rutina.
 * Esta es la definicion base que se guarda en la biblioteca de rutinas.
 */
export type RoutineTemplate = {
  id: string; // Identificador unico de la rutina, ej: 'fuerza-hipertrofia-4d'
  title: string;
  description: string;
  goal?: string; // Objetivo principal
  level: RoutineLevel;
  durationWeeks?: number; // Duracion estimada en semanas
  frequency: string; // ej: '4 dias/semana'
  equipment: Equipment[];
  days: RoutineDayTemplate[];
};


// ==========================================================================================
// --- MODELO DE DATOS DE RUTINAS HIDRATADAS
// ==========================================================================================
// Las rutinas "hidratadas" son objetos completos listos para ser usados en la UI.
// Contienen los detalles completos de cada ejercicio, no solo sus IDs.

/**
 * Un ejercicio dentro de una rutina ya procesada.
 * Es la fusion de 'Exercise' (info base) y 'RoutineExerciseConfig' (parametros).
 */
export type RoutineExercise = Exercise & {
  sets: number;
  repRange: string;
  rest: string;
  tip?: string;
};

/**
 * Un dia de entrenamiento completamente detallado, listo para la UI.
 */
export type RoutineDay = {
  id: string;
  title: string;
  focus?: string;
  notes?: string;
  warmup?: string[];
  finisher?: string[];
  exercises: RoutineExercise[]; // Contiene los objetos de ejercicio completos
};

/**
 * La rutina completa y procesada, con todos los datos necesarios para su visualizacion y uso.
 */
export type Routine = {
  id: string;
  title: string;
  description: string;
  goal?: string;
  level: RoutineLevel;
  durationWeeks?: number;
  frequency: string;
  equipment: Equipment[];
  days: RoutineDay[];
};

// ==========================================================================================
// --- MODELO DE DATOS DE MEDICIONES
// ==========================================================================================

/**
 * Representa una entrada de medicion corporal en una fecha especifica.
 */
export type Measurement = {
  id: string; // ID unico del documento de Firestore
  date: string; // Fecha en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
  weightKg: number;
  bodyFatPct?: number | null;
  chest?: number | null;
  waist?: number | null;
  hips?: number | null;
  arm?: number | null;
  thigh?: number | null;
  calf?: number | null;
  notes?: string | null;
};

// ==========================================================================================
// --- MODELO DE DATOS DE REGISTROS (LOGS)
// ==========================================================================================

/**
 * Representa un set individual registrado para un ejercicio.
 */
export type RoutineLogSet = {
  reps: number;
  weight: string;
  rir?: number; // Reps in Reserve
};

/**
 * Representa el registro de un ejercicio especifico dentro de una sesion de entrenamiento.
 */
export type RoutineLogEntry = {
  exerciseId: string;
  exerciseName: string;
  sets: RoutineLogSet[];
  comment?: string; // Comentarios especificos del ejercicio
  notes?: string;
};

/**
 * Representa el registro completo de una sesion de entrenamiento de un dia especifico.
 */
export type RoutineLog = {
  id: string; // ID unico del log
  date: string; // Fecha de la sesion en formato ISO
  routineId?: string;
  routineName?: string;
  dayId?: string;
  dayName?: string;
  entries: RoutineLogEntry[];
  effort?: number; // Percepcion del esfuerzo (ej: 1-10)
  duration?: string; // Duracion total de la sesion (ej: '1h 15m')
};

// ==========================================================================================
// --- MODELO DE DATOS DE USUARIO
// ==========================================================================================

/**
 * Perfil extendido del usuario.
 */
export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  heightCm?: number | null;
  weightKg?: number | null; // Cached latest weight for quick access
  bodyFatPct?: number | null; // Cached latest body fat
  createdAt: string;
  // Social
  username?: string | null;
  bio?: string | null;
  isPrivate?: boolean;
};

// ==========================================================================================
// --- MODELO DE DATOS DE DIETA
// ==========================================================================================

export type MealType = 'Desayuno' | 'Almuerzo' | 'Comida' | 'Merienda' | 'Cena';

export type DietFoodEntry = {
  id: string; // NutriFlow Food ID or UUID for custom entry
  name: string;
  brand?: string;
  servingId?: string; // NutriFlow Serving ID
  servingLabel: string; // e.g., "1 cup" or "100g"
  metricAmount: number; // calculated metric weight
  metricUnit: string; // "g" or "ml"
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
};

export type DietMeal = {
  id: string; // Unique ID for the meal instance (for drag-drop or referencing)
  type: MealType;
  foods: DietFoodEntry[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
};

export type DietDay = {
  id: string; // 'lunes', 'tue', etc.
  name: string; // 'Lunes'
  meals: DietMeal[];
  totalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
};

export type Diet = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isActive: boolean;
  days: DietDay[]; // Usually 7 days
  createdAt: string;
  updatedAt: string;
};
