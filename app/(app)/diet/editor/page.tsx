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
    { id: "wed", name: "Miercoles" },
    { id: "thu", name: "Jueves" },
    { id: "fri", name: "Viernes" },
    { id: "sat", name: "Sabado" },
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
            id: crypto.randomUUID(), // Unique instance ID
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

            // Recalculate day totals
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

            // Recalculate day totals
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
            toast.error("Ponle un nombre a tu dieta");
            return;
        }

        const toastId = toast.loading("Guardando dieta...");
        try {
            await createDiet(null, user.uid, {
                userId: user.uid,
                name: dietName,
                isActive: true, // Auto-activate for now
                days: dietDays,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            toast.success("Dieta guardada!", { id: toastId });
            router.push("/diet");
        } catch (e) {
            console.error(e);
            toast.error("Error al guardar", { id: toastId });
        }
    };

    if (isSearchOpen) {
        return (
            <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark font-sans text-brand-text-main md:mx-auto md:mt-0 md:min-h-screen md:w-full md:max-w-lg md:rounded-3xl md:shadow-2xl">
                <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-brand-border p-4 pt-12 md:pt-4">
                        <h2 className="font-bold text-brand-text-main">Anadir alimento</h2>
                        <button onClick={() => setIsSearchOpen(false)} className="text-sm font-semibold text-brand-text-muted">Cerrar</button>
                    </div>
                    <div className="h-[calc(100vh-60px)]">
                        <FoodSearch onAddFood={handleAddFood} onClose={() => setIsSearchOpen(false)} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-auto md:mt-0 md:min-h-screen md:w-full md:max-w-lg md:rounded-3xl md:shadow-2xl">
            <div className="flex-1 overflow-y-auto w-full">
                {/* Header */}
                <header className="sticky top-0 z-10 border-b border-brand-border bg-brand-dark/90 px-4 py-4 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-brand-text-muted">
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <input
                            type="text"
                            placeholder="Nombre de la nueva dieta..."
                            value={dietName}
                            onChange={(e) => setDietName(e.target.value)}
                            className="w-full bg-transparent text-lg font-bold text-brand-text-main placeholder-brand-text-muted outline-none"
                        />
                        <button onClick={handleSave} className="rounded-full bg-brand-primary p-2 text-brand-dark shadow-lg shadow-brand-primary/20">
                            <Save className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Day Selector */}
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {dietDays.map((day) => (
                            <button
                                key={day.id}
                                onClick={() => setSelectedDayId(day.id)}
                                className={clsx(
                                    "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                                    selectedDayId === day.id
                                        ? "bg-brand-primary text-brand-dark shadow-md"
                                        : "bg-brand-surface text-brand-text-muted border border-brand-border shadow-sm"
                                )}
                            >
                                {day.name}
                            </button>
                        ))}
                    </div>

                    {/* Daily Macro Summary */}
                    <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-surface border border-brand-border px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Calculator className="h-4 w-4 text-brand-primary" />
                            <span className="text-xs font-bold text-brand-text-main">Total Diario</span>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <div className="text-center">
                                <span className="block font-bold text-brand-text-main">{Math.round(activeDay?.totalCalories || 0)}</span>
                                <span className="text-[10px] text-brand-text-muted">kcal</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-emerald-400">{Math.round(activeDayMacros.protein)}g</span>
                                <span className="text-[10px] text-brand-text-muted">Prot</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-amber-400">{Math.round(activeDayMacros.carbs)}g</span>
                                <span className="text-[10px] text-brand-text-muted">Carb</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-rose-400">{Math.round(activeDayMacros.fat)}g</span>
                                <span className="text-[10px] text-brand-text-muted">Grasa</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Meals List */}
                <div className="space-y-4 p-4">
                    {activeDay?.meals.map((meal) => (
                        <div key={meal.id} className="rounded-2xl border border-brand-border bg-brand-surface p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-brand-text-main">{meal.type}</h3>
                                <button
                                    onClick={() => { setActiveMealId(meal.id); setIsSearchOpen(true); }}
                                    className="rounded-full bg-brand-dark border border-brand-border p-1.5 text-brand-primary hover:bg-brand-border"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Food List */}
                            <div className="mt-4 space-y-3">
                                {meal.foods.length === 0 ? (
                                    <p className="text-xs italic text-brand-text-muted/50">Sin alimentos</p>
                                ) : (
                                    meal.foods.map((food) => (
                                        <div key={food.id} className="flex flex-col gap-1 rounded-xl bg-brand-dark px-3 py-2 border border-brand-border">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-semibold text-brand-text-main leading-tight">{food.name}</p>
                                                <button
                                                    onClick={() => removeFood(meal.id, food.id)}
                                                    className="text-brand-text-muted hover:text-red-400 ml-2 mt-0.5"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-[10px] text-brand-text-muted">
                                                    {Math.round(food.metricAmount)}{food.metricUnit} | {Math.round(food.calories)} kcal
                                                </p>
                                                <p className="text-[10px] font-medium tracking-wide">
                                                    <span className="text-emerald-400">P:{Math.round(food.macros.protein)}</span>
                                                    <span className="ml-1.5 text-amber-400">C:{Math.round(food.macros.carbs)}</span>
                                                    <span className="ml-1.5 text-rose-400">F:{Math.round(food.macros.fat)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Meal Totals */}
                            {meal.foods.length > 0 && (
                                <div className="mt-3 flex justify-end border-t border-brand-border pt-2 text-[10px] font-medium text-brand-text-muted">
                                    <span>{Math.round(meal.totalCalories)} kcal total</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

