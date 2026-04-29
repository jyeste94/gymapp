"use client";

import { Calendar, MoreHorizontal, Salad, List, Users, BarChart3, ChefHat } from "lucide-react";
import { PremiumBanner, CalorieCard, MealCard, CoachBubble } from "@/components/fitia-components";

const DAYS = [
  { letter: "L", number: 28, active: false },
  { letter: "M", number: 29, active: true },
  { letter: "M", number: 30, active: false },
  { letter: "J", number: 31, active: false },
  { letter: "V", number: 1, active: false },
  { letter: "S", number: 2, active: false },
  { letter: "D", number: 3, active: false },
];

export default function DietDashboardPage() {
  const macros = [
    { label: "Proteínas", value: 0, target: 140, color: "#FFC400" },
    { label: "Carbs", value: 0, target: 167, color: "#FFC400" },
    { label: "Grasas", value: 0, target: 58, color: "#FFC400" },
  ];

  const bottomTabs = [
    { icon: Salad, label: "Plan", active: true },
    { icon: List, label: "Lista", active: false },
    { icon: Users, label: "Teams", active: false },
    { icon: BarChart3, label: "Progreso", active: false },
    { icon: ChefHat, label: "Coach", active: false },
  ];

  return (
    <div className="mx-auto max-w-md pb-32">
      {/* Days of week */}
      <div className="flex justify-between px-1 mb-5">
        {DAYS.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-[#6F6F6F]">{d.letter}</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${d.active ? "bg-[#050505] text-white" : "bg-transparent text-[#6F6F6F]"}`}>
              <span className={`text-sm font-semibold ${d.active ? "text-white" : ""}`}>{d.number}</span>
            </div>
            {!d.active && <div className="h-1 w-1 rounded-full bg-[#BDBDBD]" />}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#6F6F6F]" />
          <span className="text-[18px] font-bold text-[#050505]">Hoy</span>
        </div>
        <button className="rounded-full p-1.5 hover:bg-gray-100">
          <MoreHorizontal className="h-5 w-5 text-[#6F6F6F]" />
        </button>
      </div>

      {/* Premium Banner */}
      <PremiumBanner />

      <div className="h-4" />

      {/* Calorie Card */}
      <CalorieCard macros={macros} />

      <div className="h-4" />

      {/* Meal Cards */}
      <div className="space-y-3">
        {["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"].map((meal) => (
          <MealCard key={meal} title={meal} icon={<Salad className="h-5 w-5 text-[#BDBDBD]" />} />
        ))}
      </div>

      {/* Coach Bubble */}
      <CoachBubble />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md">
        <div className="mx-3 mb-3 rounded-[28px] bg-white/95 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[20px] border border-[#ECECEC]">
          <div className="flex items-center justify-around">
            {bottomTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.label} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${tab.active ? "bg-[#FFF4CF]" : ""}`}>
                  <Icon className={`h-[19px] w-[19px] ${tab.active ? "text-[#050505]" : "text-[#6F6F6F]"}`} strokeWidth={tab.active ? 2.5 : 2} />
                  <span className={`text-[9px] font-semibold tracking-tight ${tab.active ? "text-[#050505]" : "text-[#6F6F6F]"}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
