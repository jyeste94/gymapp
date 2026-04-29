"use client";
import { FlaskConical, Gift, Sparkles } from "lucide-react";

export function PremiumBanner() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-fitia-premium px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-fitia-yellow" />
        <span className="text-sm font-semibold text-white">Ahorra 75% en Premium</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-white/80">13h 57m 33s</span>
        <Sparkles className="h-3.5 w-3.5 text-fitia-yellow" />
      </div>
    </div>
  );
}

export function CalorieCard({ consumed = 0, target = 1754, macros }: {
  consumed?: number; target?: number;
  macros: { label: string; value: number; target: number; color: string }[];
}) {
  const pct = Math.min((consumed / target) * 100, 100);

  return (
    <div className="rounded-[22px] bg-white px-5 py-6 shadow-card space-y-5">
      <div className="text-center">
        <span className="text-[22px] font-bold text-[#050505]">{consumed} / {target}</span>
        <p className="text-xs text-[#6F6F6F] mt-0.5">kcal</p>
      </div>

      <svg viewBox="0 0 120 60" className="h-16 w-full">
        <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#ECECEC" strokeWidth="6" strokeLinecap="round" />
        <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#FFC400" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${pct * 1.57} 157`} />
      </svg>

      <div className="flex gap-2">
        {macros.map((m) => (
          <div key={m.label} className="flex-1 text-center border-t border-[#ECECEC] pt-2.5">
            <span className="text-xs text-[#6F6F6F]">{m.label}</span>
            <p className="text-sm font-bold text-[#050505] mt-0.5">{m.value} / {m.target} g</p>
            <div className="mt-1.5 h-1 w-full rounded-full bg-[#F3F3F3]">
              <div className="h-full rounded-full bg-fitia-yellow" style={{ width: `${Math.min((m.value / m.target) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <button disabled className="w-full rounded-xl bg-[#F3F3F3] py-3 text-sm font-semibold text-[#BDBDBD] cursor-not-allowed">
        Terminar Día
      </button>
    </div>
  );
}

export function MealCard({ title, kcal = 0, protein = 0, carbs = 0, fat = 0, icon }: {
  title: string; kcal?: number; protein?: number; carbs?: number; fat?: number; icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] bg-white px-5 py-4 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-[#050505]">{title}</span>
        {icon}
      </div>
      <p className="text-xs text-[#6F6F6F]">{kcal} kcal · {protein} P | {carbs} C | {fat} G</p>
      <button className="w-full rounded-xl bg-[#F3F3F3] py-2.5 text-sm font-medium text-[#6F6F6F] flex items-center justify-center gap-1.5">
        <span className="text-lg leading-none">+</span>
      </button>
    </div>
  );
}

export function CoachBubble() {
  return (
    <div className="fixed bottom-[100px] left-1/2 z-40 -translate-x-1/2 animate-bounce">
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[#ECECEC]">
        <FlaskConical className="h-4 w-4 text-fitia-yellow" />
        <span className="text-xs font-medium text-[#050505] whitespace-nowrap">Hola! Soy Nutri Coach 👋 Pregúntame algo</span>
      </div>
    </div>
  );
}
