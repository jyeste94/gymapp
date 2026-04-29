"use client";
import { ChevronRight, Gift, Sparkles, FlaskConical, Plus, X, Menu, Dumbbell, Utensils, LogOut, Settings, Home } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ============================
// Week Selector
// ============================
export function WeekSelector({ days, activeDay }: { days: { letter: string; number: number }[]; activeDay: number }) {
  return (
    <div className="flex justify-between px-1 mb-5">
      {days.map((d, i) => {
        const isActive = d.number === activeDay;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-[#6F6F6F]">{d.letter}</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isActive ? "bg-[#050505]" : ""}`}>
              <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-[#6F6F6F]"}`}>{d.number}</span>
            </div>
            {!isActive && <div className="h-1 w-1 rounded-full bg-[#BDBDBD]" />}
          </div>
        );
      })}
    </div>
  );
}

// ============================
// Premium Banner
// ============================
export function PremiumBanner() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#661616] px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-[#FFC400]" />
        <span className="text-sm font-semibold text-white">Ahorra 75% en Premium</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-white/80">13h 57m 33s</span>
        <ChevronRight className="h-3.5 w-3.5 text-white/60" />
      </div>
    </div>
  );
}

// ============================
// Smart Notice
// ============================
export function SmartNotice({ message, cta }: { message: string; cta?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#FFF4CF] px-4 py-2.5 border border-[#FFC400]/30">
      <p className="text-xs font-medium text-[#050505]/80 flex-1 pr-2">{message}</p>
      {cta && <span className="text-xs font-bold text-[#050505] whitespace-nowrap">{cta}</span>}
    </div>
  );
}

// ============================
// Calorie Progress Card
// ============================
export function CalorieProgressCard({ consumed = 0, target = 1754, macros }: {
  consumed?: number; target?: number;
  macros: { label: string; value: number; target: number }[];
}) {
  const pct = Math.min((consumed / target) * 100, 100);
  return (
    <div className="rounded-card bg-white px-5 py-6 shadow-soft space-y-5">
      <div className="text-center">
        <span className="text-[22px] font-bold text-[#050505] tabular-nums">{consumed} / {target}</span>
        <p className="text-xs text-[#6F6F6F] mt-0.5">kcal</p>
      </div>
      <svg viewBox="0 0 120 60" className="h-16 w-full">
        <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#ECECEC" strokeWidth="6" strokeLinecap="round" />
        <path d="M 10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#FFC400" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${pct * 1.57} 157`} strokeDashoffset="0" />
        <text x="60" y="38" textAnchor="middle" className="text-[8px] fill-[#6F6F6F]">0</text>
        <text x="105" y="38" textAnchor="middle" className="text-[8px] fill-[#6F6F6F]">{target}</text>
      </svg>
      <div className="grid grid-cols-3 gap-2 border-t border-[#ECECEC] pt-4">
        {macros.map((m) => {
          const pct2 = Math.min((m.value / m.target) * 100, 100);
          return (
            <div key={m.label} className="text-center">
              <span className="text-xs text-[#6F6F6F]">{m.label}</span>
              <p className="text-sm font-bold text-[#050505] mt-0.5 tabular-nums">{m.value} / {m.target} g</p>
              <div className="mt-1.5 h-1 w-full rounded-full bg-[#F3F3F3]">
                <div className="h-full rounded-full bg-[#FFC400]" style={{ width: `${pct2}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <button disabled className="w-full rounded-xl bg-[#F3F3F3] py-3 text-sm font-semibold text-[#BDBDBD] cursor-not-allowed">
        Terminar Día
      </button>
    </div>
  );
}

// ============================
// Meal Card
// ============================
export function MealCard({ title, kcal = 0, protein = 0, carbs = 0, fat = 0 }: {
  title: string; kcal?: number; protein?: number; carbs?: number; fat?: number;
}) {
  return (
    <div className="rounded-card bg-white px-5 py-4 shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-[#050505]">{title}</span>
        <div className="flex gap-1">
          <button className="rounded-lg bg-[#FFF4CF] p-1.5"><Sparkles className="h-4 w-4 text-[#FFC400]" /></button>
        </div>
      </div>
      <p className="text-xs text-[#6F6F6F]">{kcal} kcal · {protein} P | {carbs} C | {fat} G</p>
      <button className="w-full rounded-xl bg-[#F3F3F3] py-2.5 text-sm font-medium text-[#6F6F6F] flex items-center justify-center gap-1.5">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// ============================
// Coach Bubble
// ============================
export function CoachBubble({ coachName = "Nutri Coach" }: { coachName?: string }) {
  return (
    <div className="fixed bottom-[100px] left-1/2 z-30 -translate-x-1/2 animate-bounce">
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[#ECECEC]">
        <FlaskConical className="h-4 w-4 text-[#FFC400]" />
        <span className="text-xs font-medium text-[#050505] whitespace-nowrap">Hola! Soy {coachName} 👋 Pregúntame algo</span>
      </div>
    </div>
  );
}

// ============================
// Primary Button
// ============================
export function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full rounded-xl bg-[#FFC400] py-3 text-sm font-bold text-[#050505] shadow-soft active:bg-[#F4B400] disabled:bg-[#F3F3F3] disabled:text-[#BDBDBD] disabled:shadow-none transition-all">
      {children}
    </button>
  );
}

// ============================
// Bottom Tab Bar
// ============================
export function BottomTabBar({ tabs, active }: { tabs: { icon: React.ElementType; label: string }[]; active: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md">
      <div className="mx-3 mb-3 rounded-tabbar bg-white/95 px-3 py-2 shadow-tab backdrop-blur-[20px] border border-[#ECECEC]">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.label === active;
            return (
              <button key={tab.label} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${isActive ? "bg-[#FFF4CF]" : ""}`}>
                <Icon className={`h-[19px] w-[19px] ${isActive ? "text-[#050505]" : "text-[#6F6F6F]"}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] font-semibold tracking-tight ${isActive ? "text-[#050505]" : "text-[#6F6F6F]"}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ============================
// Drawer Menu
// ============================
export function DrawerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href + "/") || pathname === href;

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/routines", label: "Rutinas", icon: Dumbbell },
    { href: "/diet", label: "Dieta", icon: Utensils },
  ];

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-soft border border-[#ECECEC] lg:hidden" aria-label="Menu">
        <Menu className="h-5 w-5 text-[#050505]" />
      </button>
      {open && <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col bg-white shadow-tab transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-6 border-b border-[#ECECEC]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFC400]">
              <Utensils className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#050505]">Alex Ruiz</p>
              <p className="text-xs text-[#6F6F6F]">alex@email.com</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-[#6F6F6F]" /></button>
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active ? "bg-[#FFF4CF] text-[#050505]" : "text-[#6F6F6F] hover:bg-gray-50"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-[#FFC400]" : "bg-[#F3F3F3]"}`}>
                  <Icon className={`h-4 w-4 ${active ? "text-white" : "text-[#6F6F6F]"}`} />
                </div>
                <span className="flex-1">{item.label}</span>
                {active && <span className="text-[10px] font-bold text-[#FFC400] bg-[#FFF4CF] px-2 py-0.5 rounded-full">ACTIVO</span>}
              </Link>
            );
          })}
          <div className="border-t border-[#ECECEC] my-3" />
          <Link href="/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#6F6F6F] hover:bg-gray-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F3F3]"><Settings className="h-4 w-4" /></div>
            Ajustes
          </Link>
        </div>
        <div className="border-t border-[#ECECEC] px-3 py-4">
          <button onClick={() => { setOpen(false); router.push("/login"); }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50">
            <LogOut className="h-5 w-5" /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
