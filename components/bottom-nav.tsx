"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/rutinas", label: "Rutinas", icon: Dumbbell },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/perfil", label: "Perfil", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur z-50 pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = pathname === tab.href
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 text-xs",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
