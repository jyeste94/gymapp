"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { createDiet } from "@/lib/firestore/diets";
import type { DietDay, DietFoodEntry, MealType } from "@/lib/types";
import { NutriFlowFoodDetail, NutriFlowServing } from "@/lib/api/nutriflow";
import FoodSearch from "@/components/diet/food-search";
import { Plus, ChevronLeft, Save, Trash2, Calculator } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

const DAYS: { id: string; name: string }[] = [
    { id: "mon", name: "Lunes" },
    { id: "tue", name: "Martes" },
    { id: "wed", name: "Miércoles" },
    { id: "thu", name: "Jueves" },
    { id: "fri", name: "Viernes" },
    { id: "sat", name: "Sábado" },
    { id: "sun", name: "Domingo" },
];

const MEAL_TYPES: MealType[] = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];

export default function DietEditorPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [dietName, setDietName] = useState("");
    const [selectedDayId, setSelectedDayId] = useState("mon");
    const [dietDays, setDietDays] = useState<DietDay[]>(
        DAYS.map(d => ({
            id: d.id,
            name: d.name,
            meals: MEAL_TYPES.map((type, i) => ({
                id: `${d.id}-meal-${i}`,
                type,
                foods: [],
                totalCalories: 0,
                macros: { protein: 0, carbs: 0, fat: 0 }
            })),
            totalCalories: 0,
            macros: { protein: 0, carbs: 0, fat: 0 }
        }))
    );

    // Search Modal State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeMealId, setActiveMealId] = useState<string | null>(null);

    const activeDayIndex = useMemo(() => dietDays.findIndex(d => d.id === selectedDayId), [dietDays, selectedDayId]);
    const activeDay = dietDays[activeDayIndex];

    const calculateTotals = (foods: DietFoodEntry[]) => {
        return foods.reduce((acc, food) => ({
            calories: acc.calories + food.calories,
            protein: acc.protein + food.macros.protein,
            carbs: acc.carbs + food.macros.carbs,
            fat: acc.fat + food.macros.fat,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    };

    const handleAddFood = (food: NutriFlowFoodDetail, serving: NutriFlowServing, quantity: number) => {
        if (!activeMealId) return;

        const newFood: DietFoodEntry = {
            id: crypto.randomUUID(),
            name: food.name,
            brand: food.brand ?? undefined,
            servingId: serving.id,
            multiplier: quantity,
            servingLabel: serving.description,
            metricAmount: serving.metric_amount * quantity,
            metricUnit: serving.metric_unit,
            calories: serving.calories * quantity,
            macros: {
                protein: serving.protein_g * quantity,
                carbs: serving.carbs_g * quantity,
                fat: serving.fat_g * quantity,
            }
        };

        setDietDays(prev => prev.map(day => {
            if (day.id !== selectedDayId) return day;

            const updatedMeals = day.meals.map(meal => {
                if (meal.id !== activeMealId) return meal;

                const updatedFoods = [...meal.foods, newFood];
                const totals = calculateTotals(updatedFoods);
                return {
                    ...meal,
                    foods: updatedFoods,
                    totalCalories: totals.calories,
                    macros: totals
                };
            });

            const dayTotals = updatedMeals.reduce((acc, m) => ({
                calories: acc.calories + m.totalCalories,
                protein: acc.protein + m.macros.protein,
                carbs: acc.carbs + m.macros.carbs,
                fat: acc.fat + m.macros.fat,
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            return {
                ...day,
                meals: updatedMeals,
                totalCalories: dayTotals.calories,
                macros: dayTotals
            };
        }));
    };

    const removeFood = (mealId: string, foodId: string) => {
        setDietDays(prev => prev.map(day => {
            if (day.id !== selectedDayId) return day;

            const updatedMeals = day.meals.map(meal => {
                if (meal.id !== mealId) return meal;

                const updatedFoods = meal.foods.filter(f => f.id !== foodId);
                const totals = calculateTotals(updatedFoods);
                return {
                    ...meal,
                    foods: updatedFoods,
                    totalCalories: totals.calories,
                    macros: totals
                };
            });

            const dayTotals = updatedMeals.reduce((acc, m) => ({
                calories: acc.calories + m.totalCalories,
                protein: acc.protein + m.macros.protein,
                carbs: acc.carbs + m.macros.carbs,
                fat: acc.fat + m.macros.fat,
            }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

            return {
                ...day,
                meals: updatedMeals,
                totalCalories: dayTotals.calories,
                macros: dayTotals
            };
        }));
    };

    const activeDayMacros = activeDay?.macros || { protein: 0, carbs: 0, fat: 0 };

    const handleSave = async () => {
        if (!user) return;
        if (!dietName.trim()) {
            toast.error("Ponle un nombre a tu dieta", {
                style: { background: '#ffffff', color: '#1d1d1f', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }
            });
            return;
        }

        const toastId = toast.loading("Guardando dieta...", {
            style: { background: '#ffffff', color: '#1d1d1f', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }
        });
        
        try {
            await createDiet(null, user.uid, {
                userId: user.uid,
                name: dietName,
                isActive: true,
                days: dietDays,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            toast.success("Dieta guardada!", { 
                id: toastId,
                style: { background: '#ffffff', color: '#1d1d1f', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' } 
            });
            router.push("/diet");
        } catch (e) {
            console.error(e);
            toast.error("Error al guardar", { 
                id: toastId,
                style: { background: '#ffffff', color: '#ff3b30', border: '1px solid rgba(255,59,48,0.2)', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' } 
            });
        }
    };

    if (isSearchOpen) {
        return (
            <div className="pb-32 pt-6 lg:pb-12 max-w-2xl mx-auto w-full px-4 lg:px-0 mt-4 md:mt-0 flex flex-col min-h-screen">
                <div className="flex items-center justify-between border-b border-apple-near-black/5 dark:border-white/5 pb-4 mb-4 mt-6">
                    <h2 className="sf-text-body-strong text-apple-near-black dark:text-white">Añadir alimento</h2>
                    <button onClick={() => setIsSearchOpen(false)} className="sf-text-body text-apple-blue hover:opacity-80 transition-opacity">Cerrar</button>
                </div>
                <div className="flex-1 bg-white dark:bg-apple-surface-1 shadow-apple-card rounded-3xl overflow-hidden p-2">
                    <FoodSearch onAddFood={handleAddFood} onClose={() => setIsSearchOpen(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="pb-32 pt-4 lg:pb-12 max-w-2xl mx-auto w-full px-4 lg:px-0 mt-4 md:mt-0">
            <header className="sticky top-0 z-20 -mx-4 -mt-4 mb-6 border-b border-apple-near-black/5 dark:border-white/5 bg-white/85 dark:bg-apple-surface-1/85 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:mt-0 sm:rounded-t-3xl shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-apple-blue hover:opacity-80 transition-opacity">
                        <ChevronLeft className="h-7 w-7" />
                    </button>
                    <input
                        type="text"
                        placeholder="Nombre de la dieta..."
                        value={dietName}
                        onChange={(e) => setDietName(e.target.value)}
                        className="w-full bg-transparent text-xl sf-text-body-strong text-apple-near-black dark:text-white placeholder:text-apple-near-black/30 dark:placeholder:text-white/30 outline-none"
                    />
                    <button onClick={handleSave} className="flex h-9 w-9 items-center justify-center rounded-full bg-apple-blue text-white shadow-sm hover:opacity-90 transition-opacity">
                        <Save className="h-4 w-4" />
                    </button>
                </div>

                {/* Day Selector */}
                <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {dietDays.map((day) => (
                        <button
                            key={day.id}
                            onClick={() => setSelectedDayId(day.id)}
                            className={clsx(
                                "whitespace-nowrap rounded-full px-4 py-1.5 sf-text-nano font-medium tracking-wide transition-colors border",
                                selectedDayId === day.id
                                    ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                                    : "bg-apple-gray dark:bg-apple-surface-2 border-apple-near-black/5 dark:border-white/5 text-apple-near-black/60 dark:text-white/60 hover:bg-apple-near-black/5 dark:hover:bg-white/5"
                            )}
                        >
                            {day.name}
                        </button>
                    ))}
                </div>

                {/* Daily Macro Summary */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white dark:bg-apple-surface-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] border border-apple-near-black/5 dark:border-white/5 px-4 py-3 mx-1">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-apple-blue" />
                        <span className="sf-text-nano font-medium uppercase tracking-widest text-apple-near-black dark:text-white">Total</span>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <span className="block sf-text-body-strong text-apple-near-black dark:text-white">{Math.round(activeDay?.totalCalories || 0)}</span>
                            <span className="sf-text-nano text-apple-near-black/50 dark:text-white/50">kcal</span>
                        </div>
                        <div className="text-center">
                            <span className="block sf-text-body-strong text-[#34C759]">{Math.round(activeDayMacros.protein)}g</span>
                            <span className="sf-text-nano text-apple-near-black/50 dark:text-white/50">Prot</span>
                        </div>
                        <div className="text-center">
                            <span className="block sf-text-body-strong text-[#FF9500]">{Math.round(activeDayMacros.carbs)}g</span>
                            <span className="sf-text-nano text-apple-near-black/50 dark:text-white/50">Carb</span>
                        </div>
                        <div className="text-center">
                            <span className="block sf-text-body-strong text-[#FF3B30]">{Math.round(activeDayMacros.fat)}g</span>
                            <span className="sf-text-nano text-apple-near-black/50 dark:text-white/50">Grasa</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Meals List */}
            <div className="space-y-5">
                {activeDay?.meals.map((meal) => (
                    <div key={meal.id} className="rounded-3xl bg-white dark:bg-apple-surface-1 shadow-apple-card border-none p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="sf-text-body-strong text-apple-near-black dark:text-white capitalize">{meal.type}</h3>
                            <button
                                onClick={() => { setActiveMealId(meal.id); setIsSearchOpen(true); }}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20 transition-colors"
                            >
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                            </button>
                        </div>

                        {/* Food List */}
                        <div className="space-y-2">
                            {meal.foods.length === 0 ? (
                                <p className="text-sm italic text-apple-near-black/40 dark:text-white/40">Sin alimentos</p>
                            ) : (
                                meal.foods.map((food) => (
                                    <div key={food.id} className="flex flex-col gap-1 rounded-2xl bg-apple-gray dark:bg-apple-surface-2 p-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] border border-apple-near-black/5 dark:border-white/5 group">
                                        <div className="flex justify-between items-start">
                                            <p className="sf-text-body font-medium text-apple-near-black dark:text-white leading-snug pr-6">{food.name}</p>
                                            <button
                                                onClick={() => removeFood(meal.id, food.id)}
                                                className="text-apple-near-black/30 dark:text-white/30 hover:text-[#ff3b30] flex-shrink-0 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-apple-near-black/5 dark:border-white/5">
                                            <p className="sf-text-nano text-apple-near-black/60 dark:text-white/60">
                                                {Math.round(food.metricAmount)}{food.metricUnit} · {Math.round(food.calories)} kcal
                                            </p>
                                            <p className="sf-text-nano font-medium tracking-wide">
                                                <span className="text-[#34C759]">P:{Math.round(food.macros.protein)}</span>
                                                <span className="ml-[6px] text-[#FF9500]">C:{Math.round(food.macros.carbs)}</span>
                                                <span className="ml-[6px] text-[#FF3B30]">G:{Math.round(food.macros.fat)}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Meal Totals */}
                        {meal.foods.length > 0 && (
                            <div className="mt-4 flex justify-end">
                                <span className="rounded-xl bg-apple-gray dark:bg-apple-surface-2 px-3 py-1.5 sf-text-caption-strong text-apple-near-black/70 dark:text-white/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                    {Math.round(meal.totalCalories)} kcal total
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
