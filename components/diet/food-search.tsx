"use client";

import { useState } from "react";
import { NutriFlowClient, type NutriFlowFoodSummary, type NutriFlowFoodDetail, type NutriFlowServing } from "@/lib/api/nutriflow";
import { Search, Plus, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import toast from "react-hot-toast";

type FoodSearchProps = {
    onAddFood: (food: NutriFlowFoodDetail, serving: NutriFlowServing, quantity: number) => void;
    onClose?: () => void;
};

export default function FoodSearch({ onAddFood }: FoodSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<NutriFlowFoodSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState<NutriFlowFoodDetail | null>(null);
    const [selectedServing, setSelectedServing] = useState<NutriFlowServing | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [loadingFoodId, setLoadingFoodId] = useState<string | null>(null);

    const search = useDebouncedCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const foods = await NutriFlowClient.searchFoods(q);
            setResults(foods);
        } catch (error) {
            console.error(error);
            toast.error("Error buscando alimentos");
        } finally {
            setLoading(false);
        }
    }, 500);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        search(e.target.value);
    };

    const handleSelectFood = async (foodId: string) => {
        setLoadingFoodId(foodId);
        try {
            const details = await NutriFlowClient.getFoodDetails(foodId);
            setSelectedFood(details);
            setSelectedServing(details.best_serving || details.servings[0]);
            setQuantity(1);
        } catch (error) {
            console.error(error);
            toast.error("Error cargando detalles");
        } finally {
            setLoadingFoodId(null);
        }
    };

    const handleAdd = () => {
        if (selectedFood && selectedServing) {
            onAddFood(selectedFood, selectedServing, quantity);
            // Reset selection to allow adding more
            setSelectedFood(null);
            setSelectedServing(null);
            setQuantity(1);
            toast.success("Alimento añadido");
        }
    };

    return (
        <div className="flex h-full flex-col bg-white">
            <header className="border-b border-zinc-100 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar alimento (ej: Manzana, Pollo...)"
                        value={query}
                        onChange={handleSearch}
                        className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#0a2e5c] focus:bg-white focus:ring-1 focus:ring-[#0a2e5c]"
                        autoFocus
                    />
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4">
                {selectedFood ? (
                    <div className="space-y-6">
                        <button
                            onClick={() => setSelectedFood(null)}
                            className="mb-2 text-xs font-semibold text-[#4b5a72] hover:underline"
                        >
                            {"<- Volver a resultados"}
                        </button>

                        <div>
                            <h3 className="text-lg font-bold text-[#0a2e5c]">{selectedFood.name}</h3>
                            <p className="text-sm text-[#4b5a72]">{selectedFood.brand}</p>
                        </div>

                        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                            <label className="mb-2 block text-xs font-semibold text-[#4b5a72]">Ración</label>
                            <select
                                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
                                value={selectedServing?.description} // Simple match mechanism, ideally use ID if available
                                onChange={(e) => {
                                    const serving = selectedFood.servings.find(s => s.description === e.target.value);
                                    if (serving) setSelectedServing(serving);
                                }}
                            >
                                {selectedFood.servings.map((s, i) => (
                                    <option key={i} value={s.description}>
                                        {s.description} ({s.metric_amount} {s.metric_unit}) - {s.calories} kcal
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                            <label className="mb-2 block text-xs font-semibold text-[#4b5a72]">Cantidad</label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(0.1, quantity - 0.5))}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600"
                                >
                                    -
                                </button>
                                <span className="text-lg font-bold text-[#0a2e5c]">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 0.5)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {selectedServing && (
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <MacroBox label="Kcal" value={Math.round(selectedServing.calories * quantity)} />
                                <MacroBox label="Prot" value={Math.round(selectedServing.protein_g * quantity)} suffix="g" />
                                <MacroBox label="Carbs" value={Math.round(selectedServing.carbs_g * quantity)} suffix="g" />
                                <MacroBox label="Grasa" value={Math.round(selectedServing.fat_g * quantity)} suffix="g" />
                            </div>
                        )}

                        <button
                            onClick={handleAdd}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a2e5c] py-3 text-sm font-semibold text-white shadow-lg transition active:scale-95"
                        >
                            <Plus className="h-4 w-4" /> Añadir a la dieta
                        </button>

                    </div>
                ) : (
                    <div className="space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-[#0a2e5c]" />
                            </div>
                        ) : results.length > 0 ? (
                            results.map((food) => (
                                <button
                                    key={food.id}
                                    onClick={() => handleSelectFood(food.id)}
                                    className="flex w-full items-center justify-between rounded-2xl border border-transparent bg-white p-3 text-left transition hover:border-zinc-200 hover:bg-zinc-50"
                                >
                                    <div>
                                        <p className="font-semibold text-[#0a2e5c]">{food.name}</p>
                                        <p className="text-xs text-[#4b5a72]">{food.brand}</p>
                                    </div>
                                    {loadingFoodId === food.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                    ) : (
                                        <Plus className="h-4 w-4 text-zinc-300" />
                                    )}
                                </button>
                            ))
                        ) : query ? (
                            <p className="py-8 text-center text-sm text-[#4b5a72]">No se encontraron resultados.</p>
                        ) : (
                            <div className="py-8 text-center text-sm text-[#4b5a72]">
                                <p>Escribe para buscar en la base de datos.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function MacroBox({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
    return (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-2">
            <p className="text-[10px] font-bold uppercase text-[#93a2b7]">{label}</p>
            <p className="font-bold text-[#0a2e5c]">{value}{suffix}</p>
        </div>
    );
}
