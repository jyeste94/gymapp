"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
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
    const { db } = useFirebase();

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
            brand: food.brand,
            servingId: undefined,
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
        if (!user || !db) return;
        if (!dietName.trim()) {
            toast.error("Ponle un nombre a tu dieta");
            return;
        }

        const toastId = toast.loading("Guardando dieta...");
        try {
            await createDiet(db, user.uid, {
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
            <div className="fixed inset-0 z-50 bg-white">
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="font-bold text-[#0a2e5c]">Añadir alimento</h2>
                    <button onClick={() => setIsSearchOpen(false)} className="text-sm font-semibold text-[#4b5a72]">Cerrar</button>
                </div>
                <div className="h-[calc(100vh-60px)]">
                    <FoodSearch onAddFood={handleAddFood} onClose={() => setIsSearchOpen(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-zinc-500">
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <input
                        type="text"
                        placeholder="Nombre de la nueva dieta..."
                        value={dietName}
                        onChange={(e) => setDietName(e.target.value)}
                        className="w-full bg-transparent text-lg font-bold text-[#0a2e5c] placeholder-zinc-300 outline-none"
                    />
                    <button onClick={handleSave} className="rounded-full bg-[#0a2e5c] p-2 text-white shadow-lg">
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
                                    ? "bg-[#0a2e5c] text-white shadow-md"
                                    : "bg-white text-[#51607c] shadow-sm"
                            )}
                        >
                            {day.name}
                        </button>
                    ))}
                </div>

                {/* Daily Macro Summary */}
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-[#0a2e5c]" />
                        <span className="text-xs font-bold text-[#0a2e5c]">Total Diario</span>
                    </div>
                    <div className="flex gap-4 text-xs">
                        <div className="text-center">
                            <span className="block font-bold text-[#0a2e5c]">{Math.round(activeDay?.totalCalories || 0)}</span>
                            <span className="text-[10px] text-zinc-400">kcal</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-emerald-600">{Math.round(activeDayMacros.protein)}g</span>
                            <span className="text-[10px] text-zinc-400">Prot</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-amber-600">{Math.round(activeDayMacros.carbs)}g</span>
                            <span className="text-[10px] text-zinc-400">Carb</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-rose-600">{Math.round(activeDayMacros.fat)}g</span>
                            <span className="text-[10px] text-zinc-400">Grasa</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Meals List */}
            <div className="space-y-4 p-4">
                {activeDay?.meals.map((meal) => (
                    <div key={meal.id} className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-[#0a2e5c]">{meal.type}</h3>
                            <button
                                onClick={() => { setActiveMealId(meal.id); setIsSearchOpen(true); }}
                                className="rounded-full bg-zinc-50 p-1.5 text-[#0a2e5c] hover:bg-zinc-100"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Food List */}
                        <div className="mt-4 space-y-3">
                            {meal.foods.length === 0 ? (
                                <p className="text-xs italic text-zinc-300">Sin alimentos</p>
                            ) : (
                                meal.foods.map((food) => (
                                    <div key={food.id} className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-800">{food.name}</p>
                                            <p className="text-xs text-zinc-500">
                                                {Math.round(food.metricAmount)}{food.metricUnit} • {Math.round(food.calories)} kcal
                                                <span className="ml-2 text-zinc-300">|</span>
                                                <span className="ml-2 text-emerald-600">P:{Math.round(food.macros.protein)}</span>
                                                <span className="ml-1 text-amber-600">C:{Math.round(food.macros.carbs)}</span>
                                                <span className="ml-1 text-rose-600">F:{Math.round(food.macros.fat)}</span>
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFood(meal.id, food.id)}
                                            className="text-zinc-300 hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Meal Totals */}
                        {meal.foods.length > 0 && (
                            <div className="mt-3 flex justify-end border-t border-zinc-50 pt-2 text-[10px] font-medium text-zinc-400">
                                <span>{Math.round(meal.totalCalories)} kcal total</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
