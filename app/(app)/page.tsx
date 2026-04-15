"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Activity, ChevronRight, Flame, Scale, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import { useDiets } from "@/lib/firestore/diets";
import { defaultExercises } from "@/lib/data/exercises";
import { defaultRoutines } from "@/lib/data/routine-library";
import { buildRoutine } from "@/lib/routine-builder";
import { mergeRoutines } from "@/lib/routine-helpers";
import type { Measurement, Routine, RoutineTemplate } from "@/lib/types";

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

const toDayId = (date = new Date()) => {
  const map = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return map[date.getDay()];
};

const formatTrend = (current?: number | null, previous?: number | null, suffix = "") => {
  if (current == null || previous == null) return { text: "Sin cambios", color: "text-brand-text-muted" };
  const delta = current - previous;
  if (Math.abs(delta) < 0.05) return { text: "Estable", color: "text-brand-text-muted" };
  const isPositive = delta > 0;
  return { 
    text: `${isPositive ? "+" : ""}${delta.toFixed(1)}${suffix}`, 
    color: isPositive ? "text-rose-400" : "text-brand-primary" 
  };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const measurementPath = user?.uid ? `users/${user.uid}/measurements` : null;
  const templatesPath = user?.uid ? `users/${user.uid}/routineTemplates` : null;

  const { data: measurements } = useCol<Measurement>(measurementPath, { by: "date", dir: "desc", limit: 4 });
  const { data: templates } = useCol<RoutineTemplate>(templatesPath, { by: "title", dir: "asc" });
  const { data: diets } = useDiets(user?.uid);

  const routines = useMemo<Routine[]>(() => {
    const custom = (templates ?? []).map((template) => buildRoutine(template, defaultExercises));
    return mergeRoutines(custom, defaultRoutines);
  }, [templates]);

  const recentRoutines = routines.slice(0, 4);
  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];

  const activeDiet = useMemo(() => diets.find((diet) => diet.isActive), [diets]);
  const todayCalories = useMemo(() => {
    if (!activeDiet) return null;
    const day = activeDiet.days.find((item) => item.id === toDayId());
    return day?.totalCalories ?? null;
  }, [activeDiet]);

  const weightTrend = formatTrend(latestMeasurement?.weightKg, previousMeasurement?.weightKg, "kg");

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen bg-mesh pb-32 pt-6 lg:pb-12"
    >
      <div className="noise-overlay absolute inset-0 z-0" />
      
      <div className="relative z-10 space-y-8 px-5 lg:px-0">
        {/* Header Section */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-bebas text-4xl uppercase text-brand-text-main md:text-5xl">
              Hola, <span className="text-brand-primary text-glow-primary">{user?.displayName?.split(" ")[0] || "Campeón"}</span>
            </h1>
            <p className="text-sm text-brand-text-muted">¿Listo para romper tus límites hoy?</p>
          </div>
          <Link href="/routines" className="btn-primary p-3 md:px-6">
            <Zap className="h-5 w-5" />
            <span className="hidden md:inline">Entrenar ahora</span>
          </Link>
        </header>

        {/* Quick Stats Grid */}
        <section className="grid gap-4 sm:grid-cols-3">
          <motion.article variants={itemVariants} className="glass-card glass-card-hover p-5 rounded-3xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Flame className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-text-muted">Energía Hoy</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono-data text-3xl font-bold text-brand-text-main">
                {todayCalories != null ? Math.round(todayCalories) : "0"}
              </span>
              <span className="text-xs text-brand-text-muted">kcal</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-brand-dark/50">
              <div className="h-full bg-brand-primary shadow-[0_0_8px_rgba(62,224,127,0.5)]" style={{ width: "65%" }} />
            </div>
          </motion.article>

          <motion.article variants={itemVariants} className="glass-card glass-card-hover p-5 rounded-3xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Scale className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-text-muted">Peso Actual</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono-data text-3xl font-bold text-brand-text-main">
                {latestMeasurement?.weightKg != null ? latestMeasurement.weightKg : "--"}
              </span>
              <span className="text-xs text-brand-text-muted">kg</span>
            </div>
            <p className={`mt-2 text-xs font-semibold ${weightTrend.color}`}>
              {weightTrend.text} esta semana
            </p>
          </motion.article>

          <motion.article variants={itemVariants} className="glass-card glass-card-hover p-5 rounded-3xl">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-text-muted">Estado Físico</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono-data text-3xl font-bold text-brand-text-main">
                {latestMeasurement?.bodyFatPct != null ? `${latestMeasurement.bodyFatPct}%` : "--"}
              </span>
              <span className="text-xs text-brand-text-muted">grasa</span>
            </div>
            <p className="mt-2 text-xs text-brand-text-muted">Sigue así, vas por buen camino</p>
          </motion.article>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Routines */}
          <motion.section variants={itemVariants} className="glass-card p-6 rounded-4xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-brand-primary" />
                <h2 className="text-xl font-bold text-brand-text-main">Tus Rutinas</h2>
              </div>
              <Link href="/routines" className="text-sm font-bold text-brand-primary hover:underline">
                Ver todo
              </Link>
            </div>

            <div className="grid gap-4">
              {recentRoutines.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-brand-border bg-brand-dark/30 p-8 text-center">
                  <p className="text-sm text-brand-text-muted">¿Aún sin plan? Crea tu primera rutina.</p>
                  <Link href="/routines" className="mt-4 btn-ghost py-2">Empezar</Link>
                </div>
              ) : (
                recentRoutines.map((routine) => (
                  <Link
                    key={routine.id}
                    href={`/routines/detail?id=${routine.id}`}
                    className="group flex items-center justify-between rounded-3xl border border-brand-border bg-brand-surface-light/50 p-4 transition-all hover:bg-brand-surface-light hover:border-brand-primary/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark border border-brand-border group-hover:border-brand-primary/20">
                        <Zap className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-brand-text-main">{routine.title}</p>
                        <p className="text-xs text-brand-text-muted">
                          {routine.days.length} días · {routine.days.reduce((total, day) => total + day.exercises.length, 0)} ejercicios
                        </p>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark transition-all group-hover:bg-brand-primary group-hover:text-brand-dark">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.section>

          {/* Activity / Progress Mini Chart Placeholder */}
          <motion.section variants={itemVariants} className="glass-card p-6 rounded-4xl">
             <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-brand-primary" />
                  <h2 className="text-xl font-bold text-brand-text-main">Tu Actividad</h2>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="relative mb-6 flex h-32 w-32 items-center justify-center">
                  <svg className="h-full w-full rotate-[-90deg]">
                    <circle cx="64" cy="64" r="58" className="fill-none stroke-brand-border" strokeWidth="10" />
                    <circle cx="64" cy="64" r="58" className="fill-none stroke-brand-primary drop-shadow-[0_0_8px_rgba(62,224,127,0.5)]" strokeWidth="10" strokeDasharray="364.4" strokeDashoffset="120" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">75%</span>
                    <span className="text-[10px] uppercase text-brand-text-muted tracking-widest">Semanal</span>
                  </div>
                </div>
                <p className="max-w-[200px] text-sm text-brand-text-muted">¡Casi completas tu objetivo de la semana! Sigue así.</p>
              </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
