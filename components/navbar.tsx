"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, Calendar, Dumbbell, Activity, BarChart3, Settings, Plus } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Calendario", href: "/calendar", icon: Calendar },
  { name: "Rutinas", href: "/workouts", icon: Dumbbell },
  { name: "Ejercicios", href: "/exercises", icon: Activity },
  { name: "Analíticas", href: "/analytics", icon: BarChart3 },
  { name: "Ajustes", href: "/settings", icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6" />
              <span className="font-bold text-xl">FitTracker</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                      pathname === item.href ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4 mr-2" />
              Registrar
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
