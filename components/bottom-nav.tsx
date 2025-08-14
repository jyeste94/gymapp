"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, Activity, BarChart3, User } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/inicio", icon: Home, label: "Inicio" },
  { href: "/rutinas", icon: Dumbbell, label: "Rutinas" },
  { href: "/ejercicios", icon: Activity, label: "Ejercicios" },
  { href: "/progreso", icon: BarChart3, label: "Progreso" },
  { href: "/perfil", icon: User, label: "Perfil" },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <ul className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-6 w-6" />
                <span className="mt-1">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
