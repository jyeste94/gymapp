"use client";

import { useMemo } from "react";
import Link from 'next/link';
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useDiets } from "@/lib/firestore/diets";
import { Plus, Apple, Utensils } from "lucide-react";

const DAYS_MAP: Record<string, string> = {
  "mon": "Lunes", "tue": "Martes", "wed": "Miércoles", "thu": "Jueves",
  "fri": "Viernes", "sat": "Sábado", "sun": "Domingo"
};

export default function DietDashboardPage() {
  const { user } = useAuth();
  const { data: diets } = useDiets(user?.uid);

  const activeDiet = useMemo(() => diets?.find(d => d.isActive), [diets]);

  const todayDayId = useMemo(() => {
    const day = new Date().getDay(); // 0 = Sunday, 1 = Monday...
    // Map JS day (0-6) to our IDs
    // our IDs: mon, tue...
    const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return map[day];
  }, []);

  const todayPlan = useMemo(() =>
    activeDiet?.days.find(d => d.id === todayDayId),
    [activeDiet, todayDayId]);

  return (
    <div className="space-y-6 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2e5c]">Tu Nutrición</h1>
          <p className="text-sm text-[#51607c]">Gestiona tus dietas y macros</p>
        </div>
        <Link
          href="/diet/editor"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a2e5c] text-white shadow-lg transition active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      {!activeDiet ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white p-10 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
            <Utensils className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#0a2e5c]">Sin dieta activa</h3>
          <p className="mt-2 text-sm text-[#51607c]">Crea tu primera dieta planificada para empezar a trackear tus macros.</p>
          <Link
            href="/diet/editor"
            className="mt-6 rounded-2xl bg-[#0a2e5c] px-6 py-2 text-sm font-semibold text-white shadow-md"
          >
            Crear Dieta
          </Link>
        </div>
      ) : (
        <>
          {/* Active Diet Card */}
          <div className="overflow-hidden rounded-3xl border border-[#0a2e5c]/10 bg-gradient-to-br from-[#0a2e5c] to-[#1a4b8c] text-white shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Dieta Activa</p>
                  <h2 className="mt-1 text-2xl font-bold">{activeDiet.name}</h2>
                  <p className="text-sm text-blue-100">{activeDiet.description || "Plan semanal personalizado"}</p>
                </div>
                <div className="rounded-full bg-white/10 p-2 backdrop-blur-md">
                  <Apple className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-blue-200">Kcal (Promedio)</p>
                  <p className="text-lg font-bold">
                    {Math.round(activeDiet.days.reduce((a, b) => a + b.totalCalories, 0) / 7)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-200">Comidas/día</p>
                  <p className="text-lg font-bold">5</p>
                </div>
                <div>
                  <p className="text-xs text-blue-200">Días</p>
                  <p className="text-lg font-bold">7</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Plan Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold text-[#0a2e5c]">Hoy ({DAYS_MAP[todayDayId]})</h3>
              <Link href={`/diet/editor`} className="text-xs font-semibold text-[#0a2e5c]">
                Editar plan
              </Link>
            </div>

            {todayPlan ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-500 mb-2">
                      <span>Progreso Diario</span>
                      <span>{Math.round(todayPlan.totalCalories)} kcal</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" style={{ width: '100%' }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span className="text-emerald-600">P: {Math.round(todayPlan.macros.protein)}g</span>
                      <span className="text-amber-600">C: {Math.round(todayPlan.macros.carbs)}g</span>
                      <span className="text-rose-600">F: {Math.round(todayPlan.macros.fat)}g</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {todayPlan.meals.map(meal => (
                    <div key={meal.id} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-50 text-xs font-bold text-[#0a2e5c]">
                          {meal.type[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0a2e5c]">{meal.type}</p>
                          <p className="text-xs text-zinc-500">{meal.foods.length} alimentos</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-zinc-400">{Math.round(meal.totalCalories)} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-center text-sm text-zinc-500">
                No hay plan configurado para hoy.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
