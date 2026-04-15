"use client";

import { useMemo } from "react";
import Link from 'next/link';
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useDiets } from "@/lib/firestore/diets";
import { Plus, Apple, Utensils } from "lucide-react";

const DAYS_MAP: Record<string, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miercoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sabado",
  sun: "Domingo",
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
    <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
      <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-text-main">Tu nutricion</h1>
            <p className="text-sm text-brand-text-muted">Gestiona tus dietas y macros</p>
          </div>
          <Link
            href="/diet/editor"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-brand-dark shadow-lg shadow-brand-primary/20 transition active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </header>

        {!activeDiet ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-border bg-brand-surface p-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <Utensils className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-brand-text-main">Sin dieta activa</h3>
            <p className="mt-2 text-sm text-brand-text-muted">Crea tu primera dieta planificada para empezar a trackear tus macros.</p>
            <Link
              href="/diet/editor"
              className="mt-6 rounded-2xl bg-brand-primary px-6 py-2 text-sm font-semibold text-brand-dark shadow-md"
            >
              Crear Dieta
            </Link>
          </div>
        ) : (
          <>
            {/* Active Diet Card */}
            <div className="overflow-hidden rounded-3xl border border-brand-border bg-brand-surface text-brand-text-main shadow-xl">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-brand-primary uppercase tracking-widest">Dieta Activa</p>
                    <h2 className="mt-1 text-2xl font-bold">{activeDiet.name}</h2>
                    <p className="text-sm text-brand-text-muted">{activeDiet.description || "Plan semanal personalizado"}</p>
                  </div>
                  <div className="rounded-full bg-brand-primary/10 p-2">
                    <Apple className="h-6 w-6 text-brand-primary" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-brand-border pt-4">
                  <div>
                    <p className="text-xs text-brand-text-muted">Kcal (Promedio)</p>
                    <p className="text-lg font-bold">
                      {Math.round(activeDiet.days.reduce((a, b) => a + b.totalCalories, 0) / 7)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-muted">Comidas por dia</p>
                    <p className="text-lg font-bold">5</p>
                  </div>
                  <div>
                    <p className="text-xs text-brand-text-muted">Dias</p>
                    <p className="text-lg font-bold">7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Plan Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-brand-text-main">Hoy ({DAYS_MAP[todayDayId]})</h3>
                <Link href={`/diet/editor`} className="text-xs font-semibold text-brand-primary">
                  Editar plan
                </Link>
              </div>

              {todayPlan ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-2xl bg-brand-surface p-4 border border-brand-border shadow-sm">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs font-semibold text-brand-text-muted mb-2">
                        <span>Progreso Diario</span>
                        <span>{Math.round(todayPlan.totalCalories)} kcal</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
                        <div className="h-full bg-brand-primary" style={{ width: '100%' }} />
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                        <span className="text-emerald-400">P: {Math.round(todayPlan.macros.protein)}g</span>
                        <span className="text-amber-400">C: {Math.round(todayPlan.macros.carbs)}g</span>
                        <span className="text-rose-400">F: {Math.round(todayPlan.macros.fat)}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {todayPlan.meals.map(meal => (
                      <div key={meal.id} className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-surface p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-border text-xs font-bold text-brand-text-main">
                            {meal.type[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-brand-text-main">{meal.type}</p>
                            <p className="text-xs text-brand-text-muted">{meal.foods.length} alimentos</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-text-muted">{Math.round(meal.totalCalories)} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-brand-border bg-brand-surface p-6 text-center text-sm text-brand-text-muted">
                  No hay plan configurado para hoy.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

