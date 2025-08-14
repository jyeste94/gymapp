import type { ReactNode } from "react"
import { BottomNav } from "@/components/bottom-nav"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-16">
      {children}
      <BottomNav />
    </div>
  )
}
