export type UUID = string;

export type Measurement = {
  id: UUID; date: string;
  weightKg: number;
  bodyFatPct?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arm?: number;
  thigh?: number;
  calf?: number;
  notes?: string;
};

export type Exercise = {
  id: UUID;
  name: string;
  muscleGroup: string[];
  equipment: string[];
  description?: string;
  technique?: string[];
  image?: string;
  video?: string;
  ormFormula?: 'Epley' | 'Brzycki';
};

export type RoutineDay = { id: UUID; name: string; exerciseIds: UUID[]; };
export type Routine = { id: UUID; name: string; days: RoutineDay[]; notes?: string; };

export type SetEntry = {
  id: UUID; exerciseId: UUID; weightKg: number; reps: number;
  rir?: number; pe?: number; notes?: string;
};
export type WorkoutSession = {
  id: UUID; date: string; routineId?: UUID; dayId?: UUID;
  sets: SetEntry[]; durationMin?: number; notes?: string;
};

export type Ingredient = {
  id: UUID; name: string;
  unit: 'g' | 'ml' | 'pcs';
  kcalPerUnit: number; proteinPerUnit: number; carbsPerUnit: number; fatPerUnit: number;
};

export type RecipeIngredient = { ingredientId: UUID; quantity: number; };
export type Recipe = {
  id: UUID; name: string; servings: number;
  ingredients: RecipeIngredient[];
  instructions?: string;
  perServing?: { kcal: number; protein: number; carbs: number; fat: number; };
};

export type MealItem = {
  id: UUID; type: 'recipe' | 'ingredient';
  refId: UUID;
  servingsOrQty: number;
  notes?: string;
};

export type DayMeals = {
  id: UUID; date?: string;
  meals: { kind: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'; items: MealItem[]; }[];
};

export type DietWeek = {
  id: UUID; name: string;
  days: DayMeals[];
  target?: { kcal: number; protein: number; carbs: number; fat: number; };
};

export type DietSettings = {
  defaultMealKinds: ('Breakfast' | 'Lunch' | 'Dinner' | 'Snack')[];
  dailyTarget: { kcal: number; protein: number; carbs: number; fat: number; };
};

export type BackupPayload = {
  measurements: Measurement[];
  exercises: Exercise[];
  routines: Routine[];
  workouts: WorkoutSession[];
  ingredients: Ingredient[];
  recipes: Recipe[];
  dietWeeks: DietWeek[];
  dietSettings: DietSettings;
};
