import { Activity, ClipboardList, Home, Ruler, Salad } from "lucide-react";

export const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/routines", label: "Rutinas", icon: ClipboardList },
  { href: "/diet", label: "Dieta", icon: Salad },
  { href: "/measurements", label: "Mediciones", icon: Ruler },
  { href: "/progress", label: "Progreso", icon: Activity },
] as const;
