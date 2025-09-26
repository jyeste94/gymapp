import "@/styles/globals.css";
import Providers from "@/app/providers";
import SidebarNav from "@/app/(app)/_components/sidebar-nav";
import AppHeader from "@/app/(app)/_components/app-header";
import SidebarFooter from "@/app/(app)/_components/sidebar-footer";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-dvh bg-transparent">
        <div className="mx-auto flex min-h-dvh max-w-[1400px] flex-col gap-6 px-5 py-8 lg:flex-row lg:px-10">
          <aside className="glass-card hidden w-full max-w-[280px] flex-shrink-0 flex-col border-[rgba(34,99,255,0.18)] bg-white/75 p-6 lg:flex">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2263ff] shadow-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Wellness</p>
                <h2 className="text-lg font-semibold text-zinc-900">Gym Flow</h2>
              </div>
            </div>

            <SidebarNav />

            <div className="mt-auto">
              <SidebarFooter />
            </div>
          </aside>

          <div className="flex flex-1 flex-col gap-6 pb-10">
            <AppHeader />
            <main className="flex-1">
              <div className="flex min-h-full flex-col gap-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </Providers>
  );
}


