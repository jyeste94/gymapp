import "@/styles/globals.css";
import Providers from "@/app/providers";
import SidebarNav from "@/app/(app)/_components/sidebar-nav";
import AppHeader from "@/app/(app)/_components/app-header";
import SidebarFooter from "@/app/(app)/_components/sidebar-footer";
import MobileNav from "@/app/(app)/_components/mobile-nav";
import type { ReactNode } from "react";
import { Dumbbell, Leaf } from "lucide-react";
import { Toaster } from 'react-hot-toast';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Toaster />
      <div className="min-h-dvh bg-transparent">
        <div className="mx-auto flex min-h-dvh max-w-[1400px] flex-col gap-6 px-5 py-8 lg:flex-row lg:px-10">
          <aside className="glass-card hidden w-full max-w-[280px] flex-shrink-0 flex-col border-[rgba(10,46,92,0.15)] bg-white/80 p-6 lg:flex">
            <div className="flex items-center gap-3">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a2e5c] shadow-sm">
                <Dumbbell className="h-6 w-6 text-[#ffae00]" />
                <Leaf className="absolute -top-1 -right-1 h-4 w-4 text-[#ff1910]" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#0a2e5c]/60">Athlos</p>
                <h2 className="text-lg font-semibold text-[#0a2e5c]">Athlos Fit</h2>
              </div>
            </div>

            <SidebarNav />

            <div className="mt-auto">
              <SidebarFooter />
            </div>
          </aside>

          <div className="flex flex-1 flex-col gap-6 pb-24 lg:pb-10">
            <AppHeader />
            <main className="flex-1">
              <div className="flex min-h-full flex-col gap-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
      <MobileNav />
    </Providers>
  );
}
