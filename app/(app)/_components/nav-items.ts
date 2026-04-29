import { Activity, ClipboardList, Dumbbell, Home, Ruler, Salad, TrendingUp, Utensils, Zap } from "lucide-react";

export const sections = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    href: "/",
    subItems: [],
  },
  {
    id: "rutinas",
    label: "Rutinas",
    icon: Dumbbell,
    href: "/routines",
    subItems: [
      { href: "/routines", label: "Mis rutinas", icon: ClipboardList },
      { href: "/exercises", label: "Ejercicios", icon: Zap },
      { href: "/progress", label: "Progreso", icon: TrendingUp },
    ],
  },
  {
    id: "dieta",
    label: "Dieta",
    icon: Utensils,
    href: "/diet",
    subItems: [
      { href: "/diet", label: "Plan actual", icon: Salad },
      { href: "/diet/plan", label: "Mis planes", icon: ClipboardList },
      { href: "/diet/editor", label: "Crear plan", icon: Utensils },
    ],
  },
] as const;

export const secondaryItems = [
  { href: "/measurements", label: "Mediciones", icon: Ruler, section: "inicio" },
  { href: "/settings", label: "Ajustes", icon: Activity, section: "inicio" },
] as const;
