"use client";
import { ChevronRight, Gift, Sparkles, FlaskConical, Plus, X, Menu, Dumbbell, Utensils, LogOut, Settings, Home } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// ============================
// MacroStat
// ============================
export function MacroStat({ label, current, goal, unit = "g", color = "hsl(var(--primary))" }: {
  label: string; current: number; goal: number; unit?: string; color?: string;
}) {
  const pct = Math.min(100, Math.round((current / goal) * 100)) || 0;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      <span className="text-[14px] font-semibold tabular-nums">
        {current} <span className="text-disabled font-medium">/ {goal} {unit}</span>
      </span>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ============================
// Gauge (SVG semicircular)
// ============================
function Gauge({ consumed = 0, target = 1754 }) {
  const r = 96, cx = 110, cy = 110;
  const ticks = Array.from({ length: 21 });
  const pct = Math.min((consumed / target) * 100, 100);
  return (
    <svg width="220" height="120" viewBox="0 0 220 120" className="block">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="hsl(var(--border))" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round" fill="none"
        strokeDasharray={`${pct * 3.01} 300`} strokeDashoffset="0" opacity={pct > 0 ? 1 : 0} />
      {ticks.map((_, i) => {
        const a = Math.PI - (i / (ticks.length - 1)) * Math.PI;
        return <line key={i} x1={cx + Math.cos(a) * (r - 14)} y1={cy - Math.sin(a) * (r - 14)} x2={cx + Math.cos(a) * (r - 22)} y2={cy - Math.sin(a) * (r - 22)} stroke="hsl(var(--border))" strokeWidth={1.5} strokeLinecap="round" />;
      })}
    </svg>
  );
}

// ============================
// CalorieProgressCard
// ============================
export function CalorieProgressCard({ consumed = 0, target = 1754 }) {
  return (
    <div className="bg-card rounded-card shadow-soft p-5">
      <div className="relative flex flex-col items-center pt-1">
        <Gauge consumed={consumed} target={target} />
        <div className="absolute inset-x-0 top-6 flex flex-col items-center">
          <span className="text-[24px] font-bold tabular-nums text-foreground">
            {consumed} <span className="text-disabled font-semibold">/ {target.toLocaleString()}</span>
          </span>
          <span className="text-[12px] text-muted-foreground mt-0.5">kcal</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-1">
        <MacroStat label="Proteinas" current={0} goal={140} color="hsl(var(--premium))" />
        <MacroStat label="Carbs" current={0} goal={167} color="hsl(var(--primary))" />
        <MacroStat label="Grasas" current={0} goal={58} color="hsl(var(--recipe-hero))" />
      </div>
      <button disabled className="w-full rounded-xl bg-secondary py-3 text-sm font-semibold text-disabled cursor-not-allowed mt-5">Terminar Dia</button>
    </div>
  );
}

// ============================
// PremiumBanner
// ============================
export function PremiumBanner() {
  return (
    <div className="flex items-center justify-between rounded-xl bg-premium px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-premium-foreground">Ahorra 75% en Premium</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-premium-foreground/80">13h 57m 33s</span>
        <ChevronRight className="h-3.5 w-3.5 text-premium-foreground/60" />
      </div>
    </div>
  );
}

// ============================
// SmartNotice
// ============================
export function SmartNotice({ message, cta }: { message: string; cta?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-primary-soft px-4 py-2.5 border border-primary/30">
      <p className="text-xs font-medium text-foreground/80 flex-1 pr-2">{message}</p>
      {cta && <span className="text-xs font-bold text-foreground whitespace-nowrap">{cta}</span>}
    </div>
  );
}

// ============================
// WeekSelector
// ============================
export function WeekSelector({ days, activeDay }: { days: { letter: string; number: number }[]; activeDay: number }) {
  return (
    <div className="flex justify-between px-1 mb-5">
      {days.map((d, i) => {
        const isActive = d.number === activeDay;
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{d.letter}</span>
            <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isActive ? "bg-foreground" : ""}`}>
              <span className={`text-sm font-semibold ${isActive ? "text-background" : "text-muted-foreground"}`}>{d.number}</span>
            </div>
            {!isActive && <div className="h-1 w-1 rounded-full bg-disabled" />}
          </div>
        );
      })}
    </div>
  );
}

// ============================
// MealCard
// ============================
export function MealCard({ title, kcal = 0, protein = 0, carbs = 0, fat = 0 }: {
  title: string; kcal?: number; protein?: number; carbs?: number; fat?: number;
}) {
  return (
    <div className="bg-card rounded-card shadow-soft p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-foreground">{title}</span>
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <p className="text-[12px] text-muted-foreground">{kcal} kcal · {protein} P | {carbs} C | {fat} G</p>
      <button className="w-full rounded-xl bg-secondary py-2.5 text-sm font-medium text-muted-foreground flex items-center justify-center gap-1.5"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

// ============================
// CoachBubble
// ============================
export function CoachBubble({ coachName = "Nutri Coach" }: { coachName?: string }) {
  return (
    <div className="fixed bottom-[100px] left-1/2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 shadow-soft border border-border">
        <FlaskConical className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-foreground whitespace-nowrap">Hola! Soy {coachName} 👋 Preguntame algo</span>
      </div>
    </div>
  );
}

// ============================
// Bottom Tab Bar
// ============================
export function BottomTabBar({ tabs, active }: { tabs: { icon: React.ElementType; label: string }[]; active: string }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-md">
      <div className="mx-3 mb-3 rounded-tabbar bg-card/95 px-3 py-2 shadow-tab backdrop-blur-[20px] border border-border">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.label === active;
            return (
              <button key={tab.label} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors ${isActive ? "bg-primary-soft" : ""}`}>
                <Icon className={`h-[19px] w-[19px] ${isActive ? "text-foreground" : "text-muted-foreground"}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[9px] font-semibold tracking-tight ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// ============================
// Primary / Disabled Buttons
// ============================
export function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-soft active:bg-primary-pressed transition-all">{children}</button>;
}

// ============================
// DrawerMenu
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
      <button onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-soft border border-border lg:hidden" aria-label="Menu">
        <Menu className="h-5 w-5 text-foreground" />
      </button>
      {open && <div className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col bg-card shadow-tab transition-transform duration-300 lg:hidden ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"><Utensils className="h-5 w-5 text-primary-foreground" /></div>
            <div><p className="text-sm font-bold text-foreground">Alex Ruiz</p><p className="text-xs text-muted-foreground">alex@email.com</p></div>
          </div>
          <button onClick={() => setOpen(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active ? "bg-primary-soft text-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-primary" : "bg-secondary"}`}>
                  <Icon className={`h-4 w-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <span className="flex-1">{item.label}</span>
                {active && <span className="text-[10px] font-bold text-primary bg-primary-soft px-2 py-0.5 rounded-full">ACTIVO</span>}
              </Link>
            );
          })}
          <div className="border-t border-border my-3" />
          <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary"><Settings className="h-4 w-4" /></div> Ajustes
          </Link>
        </div>
        <div className="border-t border-border px-3 py-4">
          <button onClick={() => { setOpen(false); router.push("/login"); }} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10">
            <LogOut className="h-5 w-5" /> Cerrar sesion
          </button>
        </div>
      </aside>
    </>
  );
}
