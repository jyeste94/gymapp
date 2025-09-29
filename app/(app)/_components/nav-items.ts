import { Home, Ruler, ClipboardList, Salad, LineChart, Settings } from "lucide-react";

export const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/routines", label: "Rutinas", icon: ClipboardList },
  { href: "/diet", label: "Dieta", icon: Salad },
  { href: "/measurements", label: "Mediciones", icon: Ruler },
  { href: "/progress", label: "Progreso", icon: LineChart },
] as const;

export const settingsNavItem = { href: "/settings", label: "Ajustes", icon: Settings } as const;
