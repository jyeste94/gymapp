import "@/styles/globals.css";
import Providers from "@/app/providers";
import SidebarNav from "@/app/(app)/_components/sidebar-nav";
import AppHeader from "@/app/(app)/_components/app-header";
import Link from "next/link";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-dvh bg-transparent">
        <div className="mx-auto flex min-h-dvh max-w-[1400px] flex-col gap-6 px-5 py-8 lg:flex-row lg:px-10">
          <aside className="glass-card hidden w-full max-w-[280px] flex-shrink-0 flex-col border-[rgba(34,99,255,0.18)] bg-white/75 p-6 lg:flex">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2263ff] via-[#ffae00] to-[#ff1910] shadow-sm">
                <Sparkles className="h-5 w-5 text-zinc-700" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Wellness</p>
                <h2 className="text-lg font-semibold text-zinc-900">Gym Flow</h2>
              </div>
            </div>

            <SidebarNav />

            <div className="mt-auto">
              <div className="mt-10 rounded-2xl border border-white/40 bg-gradient-to-br from-[rgba(34,99,255,0.12)] via-[rgba(255,174,0,0.14)] to-[rgba(255,25,16,0.12)] p-5 text-sm text-zinc-600">
                <h3 className="text-base font-semibold text-zinc-900">Tu streak</h3>
                <p className="mt-1">Lleva 4 sesiones esta semana. Mantén el ritmo para desbloquear el plan avanzado.</p>
                <Link
                  href="/progress"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:-translate-y-0.5"
                >
                  Ver progreso
                </Link>
              </div>
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
