"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { NutriFlowClient } from "@/lib/api/nutriflow";
import type { NutriFlowFoodDetail, NutriFlowServing } from "@/lib/api/nutriflow";
import FoodSearch from "@/components/diet/food-search";
import { Plus, ChevronLeft, Save, Trash2, Calculator, FlaskConical, Copy, Loader2 } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

const DAYS = [
  { id: "mon", name: "Lunes" }, { id: "tue", name: "Martes" }, { id: "wed", name: "Miércoles" },
  { id: "thu", name: "Jueves" }, { id: "fri", name: "Viernes" }, { id: "sat", name: "Sábado" }, { id: "sun", name: "Domingo" },
];

const MEAL_TYPES = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];

const OPTION_LABELS = ["A", "B", "C", "D"];

const mealTypeToApi: Record<string, string> = {
  Desayuno: "breakfast", Almuerzo: "almuerzo", Comida: "lunch", Merienda: "merienda", Cena: "dinner",
};

type FoodItem = {
  id: string; name: string; brand?: string; servingId: string;
  servingLabel: string; metricAmount: number; metricUnit: string;
  calories: number; protein: number; carbs: number; fat: number;
  quantity: number; notes: string;
};

type MealOption = {
  label: string; foods: FoodItem[];
};

type MealBlock = {
  id: string; type: string; options: MealOption[];
};

type DayBlock = {
  id: string; name: string; meals: MealBlock[];
};

export default function DietEditorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const editPlanId = searchParams.get("planId");

  const [dietName, setDietName] = useState("");
  const [description, setDescription] = useState("");
  const [supplementProtocol, setSupplementProtocol] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("mon");
  const [saving, setSaving] = useState(false);

  const [days, setDays] = useState<DayBlock[]>(() =>
    DAYS.map((d) => ({
      id: d.id, name: d.name,
      meals: MEAL_TYPES.map((type, i) => ({
        id: `${d.id}-meal-${i}`, type,
        options: [{ label: "", foods: [] }],
      })),
    }))
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState<{ dayId: string; mealId: string; optionIndex: number } | null>(null);

  // Load existing plan for editing
  useEffect(() => {
    if (!editPlanId || !user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    NutriFlowClient.getDietPlan(editPlanId).then((data: any) => {
      setDietName(data.name || "");
      setDescription(data.description || "");
      setSupplementProtocol(data.supplement_protocol || "");

      if (data.days) {
        setDays((prev) =>
          prev.map((day) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiDay = data.days.find((d: any) => d.day_of_week === day.id);
            if (!apiDay) return day;

            // Group meals by type and option_group
            const mealsByType = new Map<string, Map<string, FoodItem[]>>();
            for (const meal of apiDay.meals || []) {
              const apiType = meal.meal_type;
              const localType = Object.entries(mealTypeToApi).find(([, v]) => v === apiType)?.[0] || "Comida";
              const opt = meal.option_group || "";
              if (!mealsByType.has(localType)) mealsByType.set(localType, new Map());
              const optMap = mealsByType.get(localType)!;
              if (!optMap.has(opt)) optMap.set(opt, []);
              optMap.get(opt)!.push({
                id: meal.id, name: meal.food_name || meal.serving_description,
                brand: meal.food_brand, servingId: meal.serving_id || "",
                servingLabel: meal.serving_description || "", metricAmount: meal.multiplier || 1,
                metricUnit: "porcion", calories: meal.calories || 0,
                protein: meal.proteins || 0, carbs: meal.carbs || 0, fat: meal.fats || 0,
                quantity: meal.multiplier || 1, notes: meal.notes || "",
              });
            }

            return {
              ...day,
              meals: day.meals.map((meal) => {
                const localOpts = mealsByType.get(meal.type);
                if (!localOpts) return meal;
                const options: MealOption[] = [];
                for (const [optLabel, foods] of localOpts) {
                  options.push({ label: optLabel, foods });
                }
                return { ...meal, options: options.length > 0 ? options : meal.options };
              }),
            };
          })
        );
      }
    }).catch(() => toast.error("Error al cargar el plan"));
  }, [editPlanId, user]);

  const activeDayIndex = useMemo(() => days.findIndex((d) => d.id === selectedDayId), [days, selectedDayId]);
  const activeDay = days[activeDayIndex];

  const calcTotals = (foods: FoodItem[]) => foods.reduce(
    (a, f) => ({ cal: a.cal + f.calories, p: a.p + f.protein, c: a.c + f.carbs, g: a.g + f.fat }),
    { cal: 0, p: 0, c: 0, g: 0 }
  );

  const handleAddFood = (food: NutriFlowFoodDetail, serving: NutriFlowServing, quantity: number) => {
    if (!activeTarget) return;
    const { dayId, mealId, optionIndex } = activeTarget;

    const newItem: FoodItem = {
      id: crypto.randomUUID(), name: food.name, brand: food.brand ?? undefined,
      servingId: serving.id ?? "", servingLabel: serving.description,
      metricAmount: serving.metric_amount * quantity, metricUnit: serving.metric_unit,
      calories: serving.calories * quantity, protein: serving.protein_g * quantity,
      carbs: serving.carbs_g * quantity, fat: serving.fat_g * quantity,
      quantity, notes: "",
    };

    setDays((prev) =>
      prev.map((day) =>
        day.id !== dayId ? day : {
          ...day,
          meals: day.meals.map((meal) =>
            meal.id !== mealId ? meal : {
              ...meal,
              options: meal.options.map((opt, i) =>
                i !== optionIndex ? opt : { ...opt, foods: [...opt.foods, newItem] }
              ),
            }
          ),
        }
      )
    );
  };

  const removeFood = (mealId: string, optionIndex: number, foodId: string) => {
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        meals: day.meals.map((meal) =>
          meal.id !== mealId ? meal : {
            ...meal,
            options: meal.options.map((opt, i) =>
              i !== optionIndex ? opt : { ...opt, foods: opt.foods.filter((f) => f.id !== foodId) }
            ),
          }
        ),
      }))
    );
  };

  const updateFoodNotes = (mealId: string, optionIndex: number, foodId: string, notes: string) => {
    setDays((prev) =>
      prev.map((day) => ({
        ...day,
        meals: day.meals.map((meal) =>
          meal.id !== mealId ? meal : {
            ...meal,
            options: meal.options.map((opt, i) =>
              i !== optionIndex ? opt : {
                ...opt,
                foods: opt.foods.map((f) => f.id === foodId ? { ...f, notes } : f),
              }
            ),
          }
        ),
      }))
    );
  };

  const addOption = (mealId: string) => {
    const usedLabels = new Set<string>();
    for (const day of days) for (const meal of day.meals) if (meal.id === mealId) for (const opt of meal.options) if (opt.label) usedLabels.add(opt.label);
    const nextLabel = OPTION_LABELS.find((l) => !usedLabels.has(l)) || String.fromCharCode(65 + usedLabels.size);
    setDays((prev) => prev.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => meal.id !== mealId ? meal : { ...meal, options: [...meal.options, { label: nextLabel, foods: [] }] }),
    })));
  };

  const removeOption = (mealId: string, optionIndex: number) => {
    setDays((prev) => prev.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => meal.id !== mealId ? meal : {
        ...meal,
        options: meal.options.filter((_, i) => i !== optionIndex),
      }),
    })));
  };

  const duplicateDay = () => {
    const source = activeDay;
    if (!source) return;
    const targetId = DAYS[(activeDayIndex + 1) % 7]?.id;
    if (!targetId) return;
    setDays((prev) => prev.map((day) => day.id === targetId ? {
      ...day,
      meals: source.meals.map((m) => ({ ...m, id: `${targetId}-${m.type}`, options: m.options.map((o) => ({ ...o, foods: [...o.foods] })) })),
    } : day));
    setSelectedDayId(targetId);
    toast.success("Día copiado");
  };

  const handleSavePlan = async () => {
    if (!user || !dietName.trim()) { toast.error("Ponle un nombre a la dieta"); return; }
    setSaving(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planPayload: any = {
      name: dietName.trim(),
      description: description.trim() || undefined,
      supplement_protocol: supplementProtocol.trim() || undefined,
      is_default: true,
      days: days.map((day) => ({
        day_of_week: day.id,
        meals: day.meals.flatMap((meal) =>
          meal.options.flatMap((opt) =>
            opt.foods.filter((f) => f.servingId).map((food) => ({
              serving_id: food.servingId,
              meal_type: mealTypeToApi[meal.type] || "snack",
              multiplier: food.quantity,
              option_group: opt.label || undefined,
              notes: food.notes || undefined,
            }))
          )
        ),
      })),
    };

    try {
      if (editPlanId) {
        await NutriFlowClient.updateDietPlan(editPlanId, planPayload);
        toast.success("Plan actualizado");
      } else {
        const result = await NutriFlowClient.createDietPlan(planPayload);
        await NutriFlowClient.applyDietPlan(result.id, new Date().toISOString().slice(0, 10));
        toast.success("Plan creado y aplicado a la semana actual");
      }
      router.push("/diet/plan");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const mealTotals = useMemo(() => {
    if (!activeDay) return { cal: 0, p: 0, c: 0, g: 0 };
    return activeDay.meals.reduce((acc, meal) => {
      const best = meal.options.find((o) => o.foods.length > 0) || meal.options[0];
      if (!best) return acc;
      const t = calcTotals(best.foods);
      return { cal: acc.cal + t.cal, p: acc.p + t.p, c: acc.c + t.c, g: acc.g + t.g };
    }, { cal: 0, p: 0, c: 0, g: 0 });
  }, [activeDay]);

  if (isSearchOpen) {
    return (
      <div className="apple-page-shell max-w-2xl flex min-h-[70vh] flex-col space-y-4">
        <div className="flex items-center justify-between border-b border-apple-near-black/5 pb-4 dark:border-white/5">
          <h2 className="sf-text-body-strong text-apple-near-black dark:text-white">Añadir alimento</h2>
          <button onClick={() => setIsSearchOpen(false)} className="sf-text-body text-apple-blue hover:opacity-80">Cerrar</button>
        </div>
        <div className="flex-1 bg-white dark:bg-apple-surface-1 shadow-apple-card rounded-3xl overflow-hidden p-2">
          <FoodSearch onAddFood={handleAddFood} onClose={() => setIsSearchOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="apple-page-shell max-w-2xl space-y-5 pb-32">
      <header className="sticky top-0 z-20 rounded-3xl border border-apple-near-black/5 bg-white/90 px-4 py-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-apple-surface-1/90">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-apple-blue hover:opacity-80" aria-label="Volver">
            <ChevronLeft className="h-7 w-7" />
          </button>
          <div className="flex-1 min-w-0">
            <input type="text" placeholder="Nombre del plan..." value={dietName}
              onChange={(e) => setDietName(e.target.value)}
              className="w-full bg-transparent text-xl sf-text-body-strong text-apple-near-black dark:text-white placeholder:text-apple-near-black/30 outline-none" />
            <input type="text" placeholder="Descripción (opcional)" value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent sf-text-caption text-apple-near-black/60 placeholder:text-apple-near-black/30 outline-none mt-0.5" />
          </div>
          <button onClick={handleSavePlan} disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-apple-blue text-white shadow-sm hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
          {days.map((day) => (
            <button key={day.id} onClick={() => setSelectedDayId(day.id)}
              className={clsx("whitespace-nowrap rounded-full px-4 py-1.5 sf-text-nano font-medium tracking-wide transition-colors border",
                selectedDayId === day.id
                  ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                  : "bg-apple-gray dark:bg-apple-surface-2 border-apple-near-black/5 text-apple-near-black/60 hover:bg-apple-near-black/5")}>
              {day.name}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-white dark:bg-apple-surface-1 border border-apple-near-black/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-apple-blue" />
            <span className="sf-text-nano font-medium uppercase tracking-widest text-apple-near-black">Total día</span>
          </div>
          <div className="flex gap-4">
            <div className="text-center"><span className="block sf-text-body-strong text-apple-near-black">{Math.round(mealTotals.cal)}</span><span className="sf-text-nano text-apple-near-black/50">kcal</span></div>
            <div className="text-center"><span className="block sf-text-body-strong text-[#34C759]">{Math.round(mealTotals.p)}g</span><span className="sf-text-nano text-apple-near-black/50">Prot</span></div>
            <div className="text-center"><span className="block sf-text-body-strong text-[#FF9500]">{Math.round(mealTotals.c)}g</span><span className="sf-text-nano text-apple-near-black/50">Carb</span></div>
            <div className="text-center"><span className="block sf-text-body-strong text-[#FF3B30]">{Math.round(mealTotals.g)}g</span><span className="sf-text-nano text-apple-near-black/50">Grasa</span></div>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {activeDay?.meals.map((meal) => (
          <div key={meal.id} className="rounded-3xl bg-white dark:bg-apple-surface-1 shadow-apple-card border-none p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="sf-text-body-strong capitalize text-apple-near-black dark:text-white">{meal.type}</h3>
              <div className="flex gap-1">
                <button onClick={() => addOption(meal.id)}
                  className="rounded-full border border-apple-blue/30 px-2.5 py-0.5 sf-text-nano text-apple-blue hover:bg-apple-blue/5"
                  disabled={meal.options.length >= 4}>
                  + Opción
                </button>
                <button onClick={() => { duplicateDay(); }}
                  className="rounded-full p-1.5 text-apple-near-black/40 hover:text-apple-blue" title="Copiar día">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {meal.options.map((opt, optIdx) => (
              <div key={optIdx} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="sf-text-nano font-semibold uppercase tracking-widest text-apple-blue">
                    {opt.label ? `Opción ${opt.label}` : "Fijo"}
                  </span>
                  {meal.options.length > 1 && (
                    <button onClick={() => removeOption(meal.id, optIdx)} className="sf-text-nano text-[#ff3b30]/60 hover:text-[#ff3b30]">Quitar</button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {opt.foods.length === 0 ? (
                    <p className="sf-text-caption text-apple-near-black/40 italic pl-2">Sin alimentos</p>
                  ) : (
                    opt.foods.map((food) => (
                      <div key={food.id} className="rounded-xl bg-apple-gray dark:bg-apple-surface-2 p-3 border border-apple-near-black/5">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="sf-text-body font-medium text-apple-near-black dark:text-white">{food.name}</p>
                            <p className="sf-text-nano text-apple-near-black/50">{food.servingLabel} · {Math.round(food.calories)} kcal</p>
                          </div>
                          <button onClick={() => removeFood(meal.id, optIdx, food.id)}
                            className="text-apple-near-black/30 hover:text-[#ff3b30] flex-shrink-0">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input type="text" placeholder="¿Cómo prepararlo? Ej: Cocer 10 min, saltear con ajo..."
                          value={food.notes} onChange={(e) => updateFoodNotes(meal.id, optIdx, food.id, e.target.value)}
                          className="mt-1.5 w-full rounded-lg border border-apple-near-black/5 bg-white/60 px-2.5 py-1 sf-text-nano text-apple-near-black/70 placeholder:text-apple-near-black/30 outline-none focus:ring-1 focus:ring-apple-blue dark:bg-apple-surface-1 dark:text-white/70" />
                      </div>
                    ))
                  )}
                </div>

                <button onClick={() => { setActiveTarget({ dayId: selectedDayId, mealId: meal.id, optionIndex: optIdx }); setIsSearchOpen(true); }}
                  className="mt-1.5 flex items-center gap-1 rounded-lg border border-dashed border-apple-near-black/20 px-3 py-1.5 sf-text-nano text-apple-near-black/50 hover:border-apple-blue hover:text-apple-blue w-full justify-center dark:border-white/20">
                  <Plus className="h-3 w-3" /> Añadir alimento
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white dark:bg-apple-surface-1 shadow-apple-card border-none p-5">
        <div className="flex items-start gap-3">
          <FlaskConical className="mt-0.5 h-5 w-5 flex-shrink-0 text-apple-blue" />
          <div className="flex-1">
            <p className="sf-text-body-strong text-apple-near-black dark:text-white mb-1">Suplementación y protocolo</p>
            <textarea value={supplementProtocol} onChange={(e) => setSupplementProtocol(e.target.value)}
              placeholder="🌅 Ayunas: Jengibre + Limón + Magnesio&#10;☀️ Mañana: Omega-3&#10;🌙 Noche: Magnesio Bisglicinato&#10;📌 Descanso: OMAD (solo cena)"
              rows={4} className="input-apple resize-vertical" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSavePlan} disabled={saving || !dietName.trim()}
          className="btn-apple-primary flex-1 justify-center">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {editPlanId ? "Actualizar plan" : "Guardar y aplicar a esta semana"}
        </button>
      </div>
    </div>
  );
}
