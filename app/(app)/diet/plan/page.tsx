"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ClipboardList, FlaskConical, Loader2, Utensils } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { NutriFlowClient } from "@/lib/api/nutriflow";
import toast from "react-hot-toast";

const MEAL_ICONS: Record<string, string> = {
  breakfast: "🌅",
  almuerzo: "🥪",
  lunch: "🍗",
  merienda: "🍌",
  dinner: "🌙",
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Desayuno",
  almuerzo: "Almuerzo",
  lunch: "Comida",
  merienda: "Merienda / Post-entreno",
  dinner: "Cena",
};

const DAY_LABELS: Record<string, string> = {
  mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves",
  fri: "Viernes", sat: "Sábado", sun: "Domingo",
};

type PlanData = {
  id: string; name: string; description?: string; supplement_protocol?: string;
  is_default: boolean; days: DayData[];
};

type DayData = { day_of_week: string; sort_order: number; meals: MealData[] };
type MealData = { id: string; meal_type: string; option_group?: string; notes?: string; food_name: string; food_brand?: string; serving_description: string; multiplier: number; calories: number; proteins: number; carbs: number; fats: number };

export default function DietPlanViewPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const planId = searchParams.get("id");

  const [plans, setPlans] = useState<Array<{ id: string; name: string; description?: string; is_default: boolean; day_count: number }>>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showDay, setShowDay] = useState<string>("mon");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!user) return;
    NutriFlowClient.listDietPlans().then((list) => {
      setPlans(list);
      if (planId) {
        NutriFlowClient.getDietPlan(planId).then((data) => {
          setSelectedPlan(data as PlanData);
          setLoading(false);
        });
      } else if (list.length > 0) {
        const defaultPlan = list.find((p) => p.is_default) || list[0];
        NutriFlowClient.getDietPlan(defaultPlan.id).then((data) => {
          setSelectedPlan(data as PlanData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [user, planId]);

  const currentDay = useMemo(() => {
    if (!selectedPlan) return null;
    return selectedPlan.days.find((d) => d.day_of_week === showDay) ?? null;
  }, [selectedPlan, showDay]);

  const mealsGrouped = useMemo(() => {
    if (!currentDay) return [];
    const groups = new Map<string, MealData[]>();
    for (const meal of currentDay.meals) {
      const key = meal.meal_type;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(meal);
    }
    return Array.from(groups.entries());
  }, [currentDay]);

  const getSelectedForMeal = (mealType: string): MealData[] => {
    const option = selectedOptions[mealType];
    if (!option || !currentDay) return [];
    return currentDay.meals.filter((m) => m.meal_type === mealType && m.option_group === option);
  };

  const getOptionsForMeal = (mealType: string): string[] => {
    if (!currentDay) return [];
    return [...new Set(currentDay.meals.filter((m) => m.meal_type === mealType && m.option_group).map((m) => m.option_group!))].sort();
  };

  const handleApply = async () => {
    if (!selectedPlan) return;
    setApplying(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await NutriFlowClient.applyDietPlan(selectedPlan.id, today);
      toast.success("Plan aplicado a la semana actual");
    } catch {
      toast.error("Error al aplicar el plan");
    } finally {
      setApplying(false);
    }
  };

  const loadPlan = async (id: string) => {
    setLoading(true);
    const data = await NutriFlowClient.getDietPlan(id);
    setSelectedPlan(data as PlanData);
    setSelectedOptions({});
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="apple-page-shell flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-apple-blue" />
      </div>
    );
  }

  if (!selectedPlan && plans.length === 0) {
    return (
      <div className="apple-page-shell max-w-3xl space-y-8">
        <header>
          <p className="apple-kicker">Dieta</p>
          <h1 className="sf-display-hero text-apple-near-black dark:text-white">Plan de comidas</h1>
        </header>
        <div className="apple-panel flex flex-col items-center py-16 text-center">
          <Utensils className="mb-4 h-12 w-12 text-apple-near-black/30" />
          <p className="sf-text-body-strong text-apple-near-black dark:text-white">No tienes planes guardados</p>
          <p className="mt-1 sf-text-caption text-apple-near-black/60 max-w-sm">Crea un plan desde el editor para verlo aquí.</p>
          <Link href="/diet/editor" className="btn-apple-primary mt-6">Crear plan</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-page-shell max-w-4xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="apple-kicker">Dieta</p>
          <h1 className="sf-display-hero text-apple-near-black dark:text-white">Plan de comidas</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {plans.map((p) => (
            <button key={p.id} onClick={() => loadPlan(p.id)}
              className={`rounded-full border px-3 py-1.5 sf-text-caption transition ${selectedPlan?.id === p.id ? "border-apple-blue bg-apple-blue text-white" : "border-apple-near-black/10 bg-white text-apple-near-black/80 hover:border-apple-blue dark:border-white/15 dark:bg-apple-surface-2 dark:text-white/75"}`}>
              {p.name}
            </button>
          ))}
          <Link href="/diet/editor" className="rounded-full border border-apple-near-black/10 bg-white px-3 py-1.5 sf-text-caption text-apple-near-black/80 hover:border-apple-blue hover:text-apple-blue dark:border-white/15 dark:bg-apple-surface-2 dark:text-white/75">
            + Nuevo
          </Link>
        </div>
      </header>

      {selectedPlan && (
        <>
          <div className="apple-panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="sf-display-card-title text-apple-near-black dark:text-white">{selectedPlan.name}</h2>
                {selectedPlan.description && <p className="mt-1 sf-text-body text-apple-near-black/60">{selectedPlan.description}</p>}
              </div>
              <button onClick={handleApply} disabled={applying} className="btn-apple-primary flex-shrink-0">
                {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
                {applying ? "Aplicando..." : "Aplicar a esta semana"}
              </button>
            </div>
          </div>

          {selectedPlan.supplement_protocol && (
            <div className="apple-panel-muted rounded-2xl border border-apple-blue/10 bg-apple-blue/5 p-5">
              <div className="flex items-start gap-3">
                <FlaskConical className="mt-0.5 h-5 w-5 flex-shrink-0 text-apple-blue" />
                <div>
                  <p className="sf-text-body-strong text-apple-blue">Suplementación y protocolo</p>
                  <p className="mt-1 sf-text-caption text-apple-near-black/70 whitespace-pre-line">{selectedPlan.supplement_protocol}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-b border-apple-near-black/10 pb-3 dark:border-white/10">
            {selectedPlan.days.map((d) => (
              <button key={d.day_of_week} onClick={() => setShowDay(d.day_of_week)}
                className={`rounded-full px-3 py-1 sf-text-caption transition ${showDay === d.day_of_week ? "bg-apple-blue text-white" : "text-apple-near-black/60 hover:text-apple-blue dark:text-white/60"}`}>
                {DAY_LABELS[d.day_of_week]?.slice(0, 3) || d.day_of_week}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mealsGrouped.map(([mealType, meals]) => {
              const options = getOptionsForMeal(mealType);
              const selected = getSelectedForMeal(mealType);
              const fixedMeals = meals.filter((m) => !m.option_group);

              return (
                <div key={mealType} className="apple-panel overflow-hidden p-0">
                  <div className="flex items-center gap-3 border-b border-apple-near-black/5 px-5 py-4 dark:border-white/5">
                    <span className="text-xl">{MEAL_ICONS[mealType] || "🍽"}</span>
                    <div>
                      <p className="sf-text-body-strong text-apple-near-black dark:text-white">{MEAL_LABELS[mealType] || mealType}</p>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-3">
                    {options.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {options.map((opt) => (
                          <button key={opt} onClick={() => setSelectedOptions((prev) => ({ ...prev, [mealType]: prev[mealType] === opt ? "" : opt }))}
                            className={`rounded-full border px-3 py-1 sf-text-caption transition ${selectedOptions[mealType] === opt ? "border-apple-blue bg-apple-blue text-white" : "border-apple-near-black/10 text-apple-near-black/70 hover:border-apple-blue dark:border-white/15 dark:text-white/70"}`}>
                            Opción {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {[...fixedMeals, ...selected].map((item) => (
                      <div key={item.id} className="rounded-2xl bg-apple-gray p-4 dark:bg-apple-surface-2">
                        <p className="sf-text-body-strong text-apple-near-black dark:text-white">
                          {item.option_group && <span className="text-apple-blue font-semibold mr-1.5">Opción {item.option_group}:</span>}
                          {item.serving_description || item.food_name}
                        </p>
                        {item.notes && (
                          <div className="mt-1 flex items-start gap-1.5">
                            <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-apple-blue/60" />
                            <p className="sf-text-caption text-apple-near-black/60 italic">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}

                    {options.length > 0 && !selectedOptions[mealType] && (
                      <p className="sf-text-caption text-apple-near-black/40 dark:text-white/40 text-center py-1">
                        Selecciona una opción para ver los alimentos
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
