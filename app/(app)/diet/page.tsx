"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Apple, Droplets, Dumbbell, Flame, Plus, Utensils, Wheat } from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useDiets } from "@/lib/firestore/diets";

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

  const activeDiet = useMemo(() => diets?.find((diet) => diet.isActive), [diets]);

  const todayDayId = useMemo(() => {
    const day = new Date().getDay();
    const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return map[day];
  }, []);

  const todayPlan = useMemo(() => activeDiet?.days.find((day) => day.id === todayDayId), [activeDiet, todayDayId]);

  return (
    <div className="apple-page-shell max-w-6xl space-y-8">
      <header className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="apple-kicker">Dieta</p>
          <h1 className="sf-display-hero text-apple-near-black dark:text-white">Panel de nutricion</h1>
          <p className="mt-1 sf-text-subnav text-apple-near-black/60 dark:text-white/60">El combustible que define tus resultados.</p>
        </div>
        <Link href="/diet/editor" className="btn-apple-primary w-full md:w-auto md:px-6">
          <Plus className="mr-1 h-5 w-5" />
          <span>Editar dieta</span>
        </Link>
      </header>

      {!activeDiet ? (
        <div className="apple-panel flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-apple-blue/10">
            <Utensils className="h-10 w-10 text-apple-blue" />
          </div>
          <h3 className="sf-display-card-title text-apple-near-black dark:text-white">Sin plan activo</h3>
          <p className="mt-2 max-w-sm sf-text-body text-apple-near-black/60 dark:text-white/60">
            Crea tu primera dieta planificada para empezar a dominar tus macros y calorias.
          </p>
          <Link href="/diet/editor" className="mt-8 sf-text-body-strong text-apple-blue transition-opacity hover:opacity-80">
            Configurar plan semanal
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <div className="apple-panel relative h-full overflow-hidden p-8">
              <div className="relative z-10 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-md bg-apple-blue/10 px-2.5 py-1 sf-text-nano uppercase tracking-widest text-apple-blue">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-apple-blue opacity-50" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-apple-blue" />
                      </span>
                      Plan activo
                    </div>
                    <h2 className="mt-4 sf-display-card-title text-apple-near-black dark:text-white">{activeDiet.name}</h2>
                    <p className="mt-1 sf-text-body text-apple-near-black/60 dark:text-white/60">{activeDiet.description || "Plan semanal"}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-apple-gray text-apple-blue shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
                    <Apple className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="apple-panel-muted rounded-2xl p-4 text-center">
                    <p className="sf-text-nano uppercase tracking-widest text-apple-near-black/50 dark:text-white/50">Promedio kcal</p>
                    <p className="mt-1 sf-display-card-title text-apple-near-black dark:text-white">
                      {Math.round(activeDiet.days.reduce((acc, day) => acc + day.totalCalories, 0) / 7)}
                    </p>
                  </div>
                  <div className="apple-panel-muted rounded-2xl p-4 text-center">
                    <p className="sf-text-nano uppercase tracking-widest text-apple-near-black/50 dark:text-white/50">Comidas por dia</p>
                    <p className="mt-1 sf-display-card-title text-apple-near-black dark:text-white">5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            <div className="flex items-center justify-between px-2">
              <h3 className="sf-display-card-title text-apple-near-black dark:text-white">
                Hoy <span className="text-apple-blue">{DAYS_MAP[todayDayId]}</span>
              </h3>
              <Link href="/diet/editor" className="sf-text-body-strong text-apple-blue transition-opacity hover:opacity-80">
                Modificar
              </Link>
            </div>

            {todayPlan ? (
              <div className="space-y-6">
                <div className="apple-panel p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF3B30]/10 text-[#FF3B30]">
                        <Flame className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="sf-text-nano uppercase tracking-widest text-apple-near-black/50 dark:text-white/50">Total calorias</p>
                        <p className="text-xl sf-text-body-strong text-apple-near-black dark:text-white">{Math.round(todayPlan.totalCalories)} kcal</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-apple-gray shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
                    <div className="flex h-full w-full">
                      <div className="h-full bg-[#34C759]" style={{ width: "40%" }} title="Proteina" />
                      <div className="h-full bg-[#FF9500]" style={{ width: "40%" }} title="Carbohidratos" />
                      <div className="h-full bg-[#FF3B30]" style={{ width: "20%" }} title="Grasas" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="apple-panel-muted rounded-2xl p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-[#34C759]" />
                        <span className="sf-text-nano uppercase tracking-widest text-apple-near-black/50 dark:text-white/50">Proteina</span>
                      </div>
                      <span className="text-xl font-semibold text-[#34C759]">{Math.round(todayPlan.macros.protein)}g</span>
                    </div>
                    <div className="apple-panel-muted rounded-2xl p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Wheat className="h-4 w-4 text-[#FF9500]" />
                        <span className="sf-text-nano uppercase tracking-widest text-apple-near-black/50 dark:text-white/50">Carbos</span>
                      </div>
                      <span className="text-xl font-semibold text-[#FF9500]">{Math.round(todayPlan.macros.carbs)}g</span>
                    </div>
                    <div className="apple-panel-muted rounded-2xl p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-[#FF3B30]" />
                        <span className="sf-text-nano uppercase tracking-widest text-apple-near-black/50 dark:text-white/50">Grasas</span>
                      </div>
                      <span className="text-xl font-semibold text-[#FF3B30]">{Math.round(todayPlan.macros.fat)}g</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {todayPlan.meals.map((meal) => (
                    <div key={meal.id} className="apple-panel group flex items-center justify-between rounded-3xl border-none p-5 transition-colors hover:bg-apple-gray dark:hover:bg-apple-surface-2">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-apple-gray text-base font-semibold text-apple-blue shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
                          {meal.type[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="sf-text-body-strong capitalize text-apple-near-black dark:text-white">{meal.type}</p>
                          <p className="mt-0.5 sf-text-caption text-apple-near-black/50 dark:text-white/50">{meal.foods.length} alimentos</p>
                        </div>
                      </div>
                      <span className="rounded-xl bg-apple-gray px-3 py-1.5 sf-text-caption-strong text-apple-near-black/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2 dark:text-white/70">
                        {Math.round(meal.totalCalories)} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="apple-panel p-12 text-center sf-text-body text-apple-near-black/50 dark:text-white/50">
                Dia de descanso nutricional o sin plan configurado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
