'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, Calendar, User } from 'lucide-react'

const tabs = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/rutinas', label: 'Rutinas', icon: Dumbbell },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/perfil', label: 'Perfil', icon: User }
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation" aria-label="Menú inferior">
      <ul className="grid grid-cols-4">
        {tabs.map(t => {
          const active = pathname === t.href
          const Icon = t.icon
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-1 py-2 text-xs" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
                <Icon className={active ? 'text-primary' : 'text-muted-foreground'} />
                <span className={active ? 'text-primary' : 'text-muted-foreground'}>{t.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
