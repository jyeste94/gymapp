import { useEffect, useMemo, useState } from "react";
import { NutriFlowClient } from "@/lib/api/nutriflow";
import type { Diet, DietDay, DietFoodEntry, DietMeal, MealType } from "@/lib/types";

type DiaryEntryApi = {
  id: string;
  mealType: string;
  multiplier: number;
  serving: {
    id: string;
    description: string;
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
  food: {
    id: string;
    name: string;
    brand?: string | null;
  };
};

type DiaryApi = {
  date: string;
  entries?: DiaryEntryApi[];
};

const WEEK_DAYS: Array<{ id: string; name: string }> = [
  { id: "mon", name: "Lunes" },
  { id: "tue", name: "Martes" },
  { id: "wed", name: "Miercoles" },
  { id: "thu", name: "Jueves" },
  { id: "fri", name: "Viernes" },
  { id: "sat", name: "Sabado" },
  { id: "sun", name: "Domingo" },
];

const MEAL_TYPES: MealType[] = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];

function toApiMealType(type: MealType): string {
  if (type === "Desayuno") return "breakfast";
  if (type === "Almuerzo") return "almuerzo";
  if (type === "Comida") return "lunch";
  if (type === "Merienda") return "merienda";
  if (type === "Cena") return "dinner";
  return "snack";
}

function fromApiMealType(type: string): MealType {
  const normalized = type.toLowerCase();
  if (normalized === "breakfast") return "Desayuno";
  if (normalized === "lunch") return "Comida";
  if (normalized === "dinner") return "Cena";
  if (normalized === "almuerzo") return "Almuerzo";
  if (normalized === "merienda") return "Merienda";
  if (normalized === "snack") return "Merienda";
  return "Almuerzo";
}

function startOfWeekMonday(base = new Date()): Date {
  const date = new Date(base);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentWeekDates() {
  const monday = startOfWeekMonday();
  return WEEK_DAYS.map((day, index) => ({
    ...day,
    date: toDateString(addDays(monday, index)),
  }));
}

function createEmptyMeal(dayId: string, type: MealType, index: number): DietMeal {
  return {
    id: `${dayId}-meal-${index}`,
    type,
    foods: [],
    totalCalories: 0,
    macros: {
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  };
}

function recalcMeal(meal: DietMeal): DietMeal {
  const totals = meal.foods.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.macros.protein,
      carbs: acc.carbs + item.macros.carbs,
      fat: acc.fat + item.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    ...meal,
    totalCalories: totals.calories,
    macros: {
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    },
  };
}

function recalcDay(day: DietDay): DietDay {
  const meals = day.meals.map(recalcMeal);
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.macros.protein,
      carbs: acc.carbs + meal.macros.carbs,
      fat: acc.fat + meal.macros.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    ...day,
    meals,
    totalCalories: totals.calories,
    macros: {
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    },
  };
}

function mapDiaryEntryToFood(entry: DiaryEntryApi): DietFoodEntry {
  const multiplier = Number(entry.multiplier) || 1;
  return {
    id: entry.id,
    name: entry.food.name,
    brand: entry.food.brand ?? undefined,
    servingId: entry.serving.id,
    servingLabel: entry.serving.description,
    metricAmount: multiplier,
    metricUnit: "x",
    calories: Number(entry.serving.calories) * multiplier,
    macros: {
      protein: Number(entry.serving.proteins) * multiplier,
      carbs: Number(entry.serving.carbs) * multiplier,
      fat: Number(entry.serving.fats) * multiplier,
    },
    multiplier,
  };
}

function mapDiaryToDay(dayId: string, dayName: string, diary: DiaryApi): DietDay {
  const meals = MEAL_TYPES.map((type, index) => createEmptyMeal(dayId, type, index));
  const mealByType = new Map(meals.map((meal) => [meal.type, meal]));

  (diary.entries ?? []).forEach((entry) => {
    const mealType = fromApiMealType(entry.mealType);
    const targetMeal = mealByType.get(mealType);
    if (!targetMeal) return;
    targetMeal.foods.push(mapDiaryEntryToFood(entry));
  });

  return recalcDay({
    id: dayId,
    name: dayName,
    meals,
    totalCalories: 0,
    macros: {
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });
}

export const useDiets = (userId?: string | null) => {
  const [data, setData] = useState<Diet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setData([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const weekDates = getCurrentWeekDates();
        const diaries = await Promise.all(
          weekDates.map((day) =>
            NutriFlowClient.getDiary(day.date).catch(() => ({ date: day.date, entries: [] } as DiaryApi)),
          ),
        );

        if (cancelled) return;

        const days = weekDates.map((day, index) => mapDiaryToDay(day.id, day.name, diaries[index] as DiaryApi));
        const hasData = days.some((value) => value.meals.some((meal) => meal.foods.length > 0));
        if (!hasData) {
          setData([]);
          return;
        }

        const now = new Date().toISOString();
        setData([
          {
            id: `nutriflow-week-${weekDates[0].date}`,
            userId,
            name: "Plan semanal",
            description: "Sincronizado con NutriFlow",
            isActive: true,
            days,
            createdAt: now,
            updatedAt: now,
          },
        ]);
      } catch (error) {
        console.error("Failed to load diets from NutriFlow", error);
        if (!cancelled) {
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { data, loading };
};

export const useDiet = (_userId: string | undefined, _dietId: string) => {
  void _dietId;
  const { data, loading } = useDiets(_userId);
  return { data: data[0] ?? null, loading };
};

export const useActiveDiet = (userId?: string | null) => {
  const { data: diets } = useDiets(userId);
  return useMemo(() => diets?.find((diet) => diet.isActive) ?? null, [diets]);
};

export async function createDiet(_db: unknown, _userId: string, dietData: Omit<Diet, "id">) {
  const weekDates = getCurrentWeekDates();
  const dateByDayId = new Map(weekDates.map((day) => [day.id, day.date]));

  for (const day of dietData.days) {
    const date = dateByDayId.get(day.id);
    if (!date) continue;

    const existingDiary = (await NutriFlowClient.getDiary(date).catch(() => ({ entries: [] }))) as DiaryApi;
    await Promise.all((existingDiary.entries ?? []).map((entry) => NutriFlowClient.deleteDiaryEntry(entry.id)));

    for (const meal of day.meals) {
      for (const food of meal.foods) {
        if (!food.servingId) continue;
        const multiplier = typeof food.multiplier === "number" && food.multiplier > 0 ? food.multiplier : 1;
        await NutriFlowClient.addDiaryEntry(date, {
          serving_id: food.servingId,
          mealType: toApiMealType(meal.type),
          multiplier,
        });
      }
    }
  }

  return `nutriflow-week-${weekDates[0].date}`;
}

export async function updateDiet(_db: unknown, userId: string, _dietId: string, data: Partial<Diet>) {
  if (!data.days) {
    throw new Error("NutriFlow updateDiet requiere days");
  }
  return createDiet(null, userId, {
    userId,
    name: data.name ?? "Plan semanal",
    description: data.description,
    isActive: data.isActive ?? true,
    days: data.days,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteDiet(_db: unknown, _userId: string, _dietId: string) {
  void _db;
  void _userId;
  void _dietId;
  const weekDates = getCurrentWeekDates();
  for (const day of weekDates) {
    const diary = (await NutriFlowClient.getDiary(day.date).catch(() => ({ entries: [] }))) as DiaryApi;
    await Promise.all((diary.entries ?? []).map((entry) => NutriFlowClient.deleteDiaryEntry(entry.id)));
  }
}

export async function setDietActive(_db: unknown, _userId: string, _dietId: string) {
  void _db;
  void _userId;
  void _dietId;
  return true;
}
