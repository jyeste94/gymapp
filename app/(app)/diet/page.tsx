"use client";

import { useMemo } from "react";
import Link from 'next/link';
import { motion } from "framer-motion";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useDiets } from "@/lib/firestore/diets";
import { Plus, Apple, Utensils, Flame, Droplets, Wheat, Dumbbell } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

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
    const day = new Date().getDay(); 
    const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    return map[day];
  }, []);

  const todayPlan = useMemo(() =>
    activeDiet?.days.find(d => d.id === todayDayId),
    [activeDiet, todayDayId]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen pb-32 pt-6 lg:pb-12"
    >
      <div className="relative z-10 space-y-8 px-5 lg:px-0">
        
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-bebas text-4xl uppercase text-brand-text-main md:text-5xl">
              Panel de <span className="text-brand-primary text-glow-primary">Nutrición</span>
            </h1>
            <p className="text-sm text-brand-text-muted mt-1">El combustible que define tus resultados.</p>
          </div>
          <Link
            href="/diet/editor"
            className="btn-primary p-3 md:px-6"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden md:inline">Editar Dieta</span>
          </Link>
        </header>

        {!activeDiet ? (
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-4xl border border-dashed border-brand-border bg-brand-dark/30 py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10 border border-brand-primary/20 shadow-[0_0_20px_rgba(62,224,127,0.15)]">
              <Utensils className="h-10 w-10 text-brand-primary" />
            </div>
            <h3 className="text-2xl font-bold text-brand-text-main">Sin plan activo</h3>
            <p className="mt-2 max-w-sm text-sm text-brand-text-muted">Crea tu primera dieta planificada para empezar a dominar tus macros y calorías.</p>
            <Link
              href="/diet/editor"
              className="mt-8 btn-ghost"
            >
              Configurar Plan Semanal
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Left Column: Weekly Summary */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={itemVariants} className="glass-card overflow-hidden rounded-4xl p-6">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-brand-primary/10 blur-3xl" />
                
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                        </span>
                        Plan Activo
                      </div>
                      <h2 className="mt-4 text-3xl font-bold text-brand-text-main">{activeDiet.name}</h2>
                      <p className="mt-1 text-sm text-brand-text-muted">{activeDiet.description || "Plan semanal"}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark border border-brand-border text-brand-primary">
                      <Apple className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-brand-dark/50 border border-brand-border p-4 text-center">
                      <p className="text-xs uppercase tracking-wider text-brand-text-muted">Promedio Kcal</p>
                      <p className="mt-1 text-2xl font-bold text-brand-text-main">
                        {Math.round(activeDiet.days.reduce((a, b) => a + b.totalCalories, 0) / 7)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-brand-dark/50 border border-brand-border p-4 text-center">
                      <p className="text-xs uppercase tracking-wider text-brand-text-muted">Comidas / Día</p>
                      <p className="mt-1 text-2xl font-bold text-brand-text-main">5</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Today's Plan */}
            <div className="lg:col-span-3 space-y-6">
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-brand-text-main">Hoy <span className="text-brand-primary">{DAYS_MAP[todayDayId]}</span></h3>
                <Link href={`/diet/editor`} className="text-sm font-bold text-brand-primary hover:text-glow-primary transition-all">
                  Modificar
                </Link>
              </motion.div>

              {todayPlan ? (
                <div className="space-y-6">
                  {/* Macros Summary Card */}
                  <motion.div variants={itemVariants} className="glass-card rounded-4xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                          <Flame className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-brand-text-muted font-bold">Total Calorías</p>
                          <p className="text-xl font-bold text-brand-text-main">{Math.round(todayPlan.totalCalories)} kcal</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-2 w-full overflow-hidden rounded-full bg-brand-dark mb-6">
                      <div className="flex h-full w-full">
                        <div className="bg-emerald-400 h-full" style={{ width: '40%' }} title="Proteína" />
                        <div className="bg-amber-400 h-full" style={{ width: '40%' }} title="Carbohidratos" />
                        <div className="bg-rose-400 h-full" style={{ width: '20%' }} title="Grasas" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-brand-border/50 bg-brand-dark/30 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Dumbbell className="h-3 w-3 text-emerald-400" />
                          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Proteína</span>
                        </div>
                        <span className="text-lg font-bold text-emerald-400">{Math.round(todayPlan.macros.protein)}g</span>
                      </div>
                      <div className="rounded-xl border border-brand-border/50 bg-brand-dark/30 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Wheat className="h-3 w-3 text-amber-400" />
                          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Carbos</span>
                        </div>
                        <span className="text-lg font-bold text-amber-400">{Math.round(todayPlan.macros.carbs)}g</span>
                      </div>
                      <div className="rounded-xl border border-brand-border/50 bg-brand-dark/30 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplets className="h-3 w-3 text-rose-400" />
                          <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">Grasas</span>
                        </div>
                        <span className="text-lg font-bold text-rose-400">{Math.round(todayPlan.macros.fat)}g</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Meals List */}
                  <motion.div variants={itemVariants} className="grid gap-3">
                    {todayPlan.meals.map(meal => (
                      <div key={meal.id} className="group flex items-center justify-between rounded-3xl border border-brand-border bg-brand-surface-light/30 p-4 transition-all hover:bg-brand-surface-light hover:border-brand-primary/30">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark border border-brand-border text-sm font-bold text-brand-text-main group-hover:border-brand-primary/30 group-hover:text-brand-primary transition-all">
                            {meal.type[0]}
                          </div>
                          <div>
                            <p className="font-bold text-brand-text-main">{meal.type}</p>
                            <p className="text-xs text-brand-text-muted">{meal.foods.length} alimentos</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-brand-dark border border-brand-border px-3 py-1.5 text-xs font-bold text-brand-text-muted">
                            {Math.round(meal.totalCalories)} kcal
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>
              ) : (
                <motion.div variants={itemVariants} className="rounded-4xl border border-dashed border-brand-border bg-brand-dark/30 p-10 text-center text-sm text-brand-text-muted">
                  Día de descanso nutricional o no planificado.
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}


