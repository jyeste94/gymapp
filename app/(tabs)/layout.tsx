import type { ReactNode } from 'react'
import { BottomNav } from '@/components/bottom-nav'

export default function TabsLayout({ children }: { children: ReactNode }){
  return (
    <div className="pb-16">{children}<BottomNav/></div>
  )
}
