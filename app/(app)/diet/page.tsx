"use client";
import { Calendar, MoreHorizontal, Salad, List, Users, BarChart3, ChefHat, Sparkles, Plus } from "lucide-react";

const DAYS = [
  { letter: "L", number: 28, active: false },
  { letter: "M", number: 29, active: true },
  { letter: "M", number: 30, active: false },
  { letter: "J", number: 31, active: false },
  { letter: "V", number: 1, active: false },
  { letter: "S", number: 2, active: false },
  { letter: "D", number: 3, active: false },
];

function PremiumBanner() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#661616] px-4 py-2.5">
      <span className="text-sm font-semibold text-white">Ahorra 75% en Premium</span>
      <span className="text-xs font-medium text-white/80">13h 57m 33s</span>
    </div>
  );
}

function CalorieCard() {
  return (
    <div className="rounded-[20px] bg-white px-5 py-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-5">
      <div className="text-center">
        <span className="text-[22px] font-bold text-[#050505]">0 / 1,754</span>
        <p className="text-xs text-[#6F6F6F] mt-0.5">kcal</p>
      </div>
      <svg viewBox="0 0 120 60" className="h-16 w-full">
        <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#ECECEC" strokeWidth="6" strokeLinecap="round" />
        <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#FFC400" strokeWidth="6" strokeLinecap="round" strokeDasharray="0 157" />
      </svg>
      <div className="grid grid-cols-3 gap-2 border-t border-[#ECECEC] pt-4">
        {[
          { label: "Proteinas", v: 0, t: 140 },
          { label: "Carbs", v: 0, t: 167 },
          { label: "Grasas", v: 0, t: 58 },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <span className="text-xs text-[#6F6F6F]">{m.label}</span>
            <p className="text-sm font-bold text-[#050505] mt-0.5">{m.v} / {m.t} g</p>
            <div className="mt-1.5 h-1 w-full rounded-full bg-[#F3F3F3]">
              <div className="h-full rounded-full bg-[#FFC400]" style={{ width: "0%" }} />
            </div>
          </div>
        ))}
      </div>
      <button disabled className="w-full rounded-xl bg-[#F3F3F3] py-3 text-sm font-semibold text-[#BDBDBD] cursor-not-allowed">Terminar Dia</button>
    </div>
  );
}

function MealCard({ title }: { title: string }) {
  return (
    <div className="rounded-[20px] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-[#050505]">{title}</span>
        <Sparkles className="h-4 w-4 text-[#FFC400]" />
      </div>
      <p className="text-xs text-[#6F6F6F]">0 kcal · 0 P | 0 C | 0 G</p>
      <button className="w-full rounded-xl bg-[#F3F3F3] py-2.5 text-sm font-medium text-[#6F6F6F] flex items-center justify-center gap-1.5">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function DietDashboardPage() {
  const tabs = [
    { icon: Salad, label: "Plan", active: true },
    { icon: List, label: "Lista", active: false },
    { icon: Users, label: "Teams", active: false },
    { icon: BarChart3, label: "Progreso", active: false },
    { icon: ChefHat, label: "Coach", active: false },
  ];

  return (
    <div className="mx-auto max-w-md pb-32">
      <div className="flex justify-between px-1 mb-5">
        {DAYS.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-[#6F6F6F]">{d.letter}</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${d.active ? "bg-[#050505]" : ""}`}>
              <span className={`text-sm font-semibold ${d.active ? "text-white" : "text-[#6F6F6F]"}`}>{d.number}</span>
            </div>
            {!d.active && <div className="h-1 w-1 rounded-full bg-[#BDBDBD]" />}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#6F6F6F]" />
          <span className="text-[18px] font-bold text-[#050505]">Hoy</span>
        </div>
        <MoreHorizontal className="h-5 w-5 text-[#6F6F6F]" />
      </div>

      <PremiumBanner />
      <div className="h-4" />
      <CalorieCard />
      <div className="h-4" />
      <div className="space-y-3">
        {["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"].map((m) => <MealCard key={m} title={m} />)}
      </div>

      <div className="fixed bottom-[100px] left-1/2 z-30 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[#ECECEC]">
          <span className="text-xs font-medium text-[#050505] whitespace-nowrap">Hola! Soy Nutri Coach 👋 Preguntame algo</span>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md">
        <div className="mx-3 mb-3 rounded-[28px] bg-white/95 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-[20px] border border-[#ECECEC]">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
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
