"use client";

import { useState } from "react";
import { NutriFlowClient, type NutriFlowFoodSummary, type NutriFlowFoodDetail, type NutriFlowServing } from "@/lib/api/nutriflow";
import { Search, Plus, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import toast from "react-hot-toast";
import clsx from "clsx";

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
      const safeDetails = {
        ...details,
        servings: details.servings || [],
      };

      setSelectedFood(safeDetails);
      const initialServing = details.best_serving || safeDetails.servings[0] || null;
      setSelectedServing(initialServing);
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
      setSelectedFood(null);
      setSelectedServing(null);
      setQuantity(1);
      toast.success("Alimento anadido");
    }
  };

  return (
    <div className="flex h-full flex-col bg-apple-gray dark:bg-apple-surface-2">
      <header className="apple-divider px-4 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-near-black/40 dark:text-white/40" />
          <input
            type="text"
            placeholder="Buscar alimento (manzana, pollo, arroz...)"
            value={query}
            onChange={handleSearch}
            className="w-full py-3 pl-10 pr-4"
            autoFocus
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedFood ? (
          <div className="space-y-6">
            <button onClick={() => setSelectedFood(null)} className="apple-link sf-text-caption">
              {"<- Volver a resultados"}
            </button>

            <div>
              <h3 className="sf-display-card-title text-apple-near-black dark:text-white">{selectedFood.name}</h3>
              <p className="sf-text-caption text-apple-near-black/58 dark:text-white/58">{selectedFood.brand || "Marca no disponible"}</p>
            </div>

            <div className="apple-panel-muted p-4">
              <label className="sf-text-micro text-apple-near-black/60 dark:text-white/60">Racion</label>
              <select
                className="mt-2 w-full"
                value={selectedServing?.description}
                onChange={(e) => {
                  const serving = selectedFood.servings.find((s) => s.description === e.target.value);
                  if (serving) setSelectedServing(serving);
                }}
              >
                {selectedFood.servings?.length > 0 ? (
                  selectedFood.servings.map((s, i) => (
                    <option key={i} value={s.description}>
                      {s.description} ({s.metric_amount} {s.metric_unit}) - {s.calories} kcal
                    </option>
                  ))
                ) : (
                  <option disabled>Sin informacion de raciones</option>
                )}
              </select>
            </div>

            <div className="apple-panel-muted p-4">
              <label className="sf-text-micro text-apple-near-black/60 dark:text-white/60">Cantidad</label>
              <div className="mt-2 flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(0.1, quantity - 0.5))} className="btn-apple-ghost h-9 w-9 rounded-full p-0">
                  -
                </button>
                <span className="sf-display-card-title text-apple-near-black dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 0.5)} className="btn-apple-ghost h-9 w-9 rounded-full p-0">
                  +
                </button>
              </div>
            </div>

            {selectedServing && (
              <div className="grid grid-cols-4 gap-2 text-center">
                <MacroBox label="Kcal" value={Math.round(selectedServing.calories * quantity)} />
                <MacroBox label="Prot" value={Math.round(selectedServing.protein_g * quantity)} suffix="g" />
                <MacroBox label="Carb" value={Math.round(selectedServing.carbs_g * quantity)} suffix="g" />
                <MacroBox label="Grasa" value={Math.round(selectedServing.fat_g * quantity)} suffix="g" />
              </div>
            )}

            {!selectedServing && (
              <div className="rounded-xl border border-[#ff9500]/25 bg-[#ff9500]/10 p-3 sf-text-caption text-[#b35b00]">
                Este alimento no tiene datos suficientes de raciones o macros.
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={!selectedServing}
              className={clsx("btn-apple-primary w-full", !selectedServing && "cursor-not-allowed opacity-55")}
            >
              <Plus className="h-4 w-4" /> Anadir a la dieta
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-apple-blue" />
              </div>
            ) : results.length > 0 ? (
              results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelectFood(food.id)}
                  className="apple-panel flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-apple-gray dark:hover:bg-apple-surface-2"
                >
                  <div>
                    <p className="sf-text-body-strong text-apple-near-black dark:text-white">{food.name}</p>
                    <p className="sf-text-caption text-apple-near-black/56 dark:text-white/56">{food.brand || "Marca sin dato"}</p>
                  </div>
                  {loadingFoodId === food.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-apple-near-black/35 dark:text-white/35" />
                  ) : (
                    <Plus className="h-4 w-4 text-apple-blue" />
                  )}
                </button>
              ))
            ) : query ? (
              <p className="py-8 text-center sf-text-body text-apple-near-black/58 dark:text-white/58">No se encontraron resultados.</p>
            ) : (
              <p className="py-8 text-center sf-text-body text-apple-near-black/58 dark:text-white/58">
                Escribe para buscar en la base de datos.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MacroBox({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="apple-panel-muted rounded-xl p-2">
      <p className="sf-text-nano uppercase text-apple-near-black/45 dark:text-white/45">{label}</p>
      <p className="sf-text-body-strong text-apple-near-black dark:text-white">
        {value}
        {suffix}
      </p>
    </div>
  );
}