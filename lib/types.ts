
// Definiciones de tipos para valores especificos, evitando strings magicos.

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
  | 'Trapecio';

export type Equipment = 
  | 'Barra'
  | 'Mancuernas'
  | 'Polea'
  | 'Maquina'
  | 'Peso corporal';

export type RoutineLevel = 'Principiante' | 'Intermedio' | 'Avanzado';
export type RoutineIntensity = 'Bajo' | 'Moderado' | 'Intenso';
export type RoutineFrequency = '3 dias' | '4 dias' | '5 dias';
export type DayIntensity = 'Bajo' | 'Moderado' | 'Intenso';


// Definicion central del modelo de datos para un ejercicio.

export type Exercise = {
    id: string;
    name: string;
    description: string;
    muscleGroup: MuscleGroup[];
    equipment: Equipment[];
    technique: string[];
    image?: string;
    video?: string;
};

// Definicion para los registros de medidas corporales.
export type Measurement = {
    id: string;
    date: string;
    weightKg: number;
    bodyFatPct?: number;
    chest?: number;
    waist?: number;
    arm?: number;
    notes?: string;
};


// --- Modelo de Datos para Planes de Rutina ---

export type RoutineExerciseConfig = {
    id: string;
    sets: number;
    repRange: string;
    rest: string;
    tip: string;
  };
  
export type RoutineExercise = Exercise & RoutineExerciseConfig;

export type RoutineDay = {
    id: string;
    name: string;
    focus: string;
    intensity: DayIntensity;
    estimatedDuration: string;
    notes: string;
    warmup: string[];
    finisher?: string[];
    legacyNames?: string[];
    exercises: RoutineExerciseConfig[];
};

export type RoutinePlan = {
    name: string;
    goal: string;
    level: RoutineLevel;
    durationWeeks: number;
    frequency: RoutineFrequency;
    equipment: Equipment[];
    days: RoutineDay[];
};
