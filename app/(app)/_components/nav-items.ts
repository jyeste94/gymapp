import { Home, ClipboardList, Salad, User, Users, Settings } from "lucide-react";

export const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/routines", label: "Rutinas", icon: ClipboardList },
  { href: "/diet", label: "Dieta", icon: Salad },
  { href: "/social", label: "Comunidad", icon: Users },
  { href: "/settings/profile", label: "Perfil", icon: User },
] as const;

export const settingsNavItem = { href: "/settings", label: "Ajustes", icon: Settings } as const;
