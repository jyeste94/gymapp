"use client";
import { Calendar, MoreHorizontal, Users, BarChart3, ChefHat, List, Salad } from "lucide-react";
import { PremiumBanner, CalorieProgressCard, MealCard, CoachBubble, BottomTabBar, WeekSelector } from "@/components/nutri-components";

const DAYS = [
  { letter: "L", number: 28 }, { letter: "M", number: 29 }, { letter: "M", number: 30 },
  { letter: "J", number: 31 }, { letter: "V", number: 1 }, { letter: "S", number: 2 }, { letter: "D", number: 3 },
];

const MEALS = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"];

export default function DietDashboardPage() {
  return (
    <div className="mx-auto max-w-md pb-32">
      <WeekSelector days={DAYS} activeDay={29} />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-[18px] font-bold text-foreground">Hoy</span>
        </div>
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
      </div>

      <PremiumBanner />
      <div className="h-4" />
      <CalorieProgressCard />
      <div className="h-4" />

      <div className="space-y-3">
        {MEALS.map((m) => <MealCard key={m} title={m} />)}
      </div>

      <CoachBubble />
      <BottomTabBar
        tabs={[
          { icon: Salad, label: "Plan" },
          { icon: List, label: "Lista" },
          { icon: Users, label: "Teams" },
          { icon: BarChart3, label: "Progreso" },
          { icon: ChefHat, label: "Coach" },
        ]}
        active="Plan"
      />
    </div>
  );
}
