import "@/styles/globals.css";
import Providers from "@/app/providers";
import SidebarNav from "@/app/(app)/_components/sidebar-nav";
import SidebarFooter from "@/app/(app)/_components/sidebar-footer";
import MobileNav from "@/app/(app)/_components/mobile-nav";
import MobileProfileLink from "@/app/(app)/_components/mobile-profile-link";
import type { ReactNode } from "react";
import { Dumbbell, Sparkles } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import ClientAuthGuard from "@/components/auth/client-auth-guard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ClientAuthGuard>
        <Toaster />
        <div className="relative min-h-dvh overflow-x-hidden bg-brand-dark font-sans selection:bg-brand-primary/30">
          {/* Global Visual Accents */}
          <div className="bg-mesh fixed inset-0 z-0" />
          <div className="noise-overlay fixed inset-0 z-[1]" />
          
          <div className="relative z-10 mx-auto flex min-h-dvh max-w-[1500px] flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8 lg:py-10">
            {/* Sidebar Desktop */}
            <aside className="glass-card sticky top-10 hidden h-[calc(100dvh-5rem)] w-full max-w-[300px] flex-shrink-0 flex-col rounded-[2.5rem] p-6 shadow-2xl lg:flex">
              <div className="flex items-center gap-4 px-2">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-dark shadow-inner border border-brand-white/5">
                  <Dumbbell className="h-7 w-7 text-brand-primary drop-shadow-[0_0_8px_rgba(62,224,127,0.5)]" />
                  <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-brand-accent animate-pulse-slow" />
                </div>
                <div>
                  <p className="font-bebas text-sm uppercase tracking-[0.2em] text-brand-text-muted">Athlos</p>
                  <h2 className="text-2xl font-bold tracking-tight text-brand-text-main">Fit <span className="text-brand-primary text-glow-primary">Elite</span></h2>
                </div>
              </div>

              <SidebarNav />

              <div className="mt-auto pt-6 border-t border-brand-white/5">
                <SidebarFooter />
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col pb-28 lg:pb-0">
              <main className="flex-1">
                {children}
              </main>
            </div>
          </div>
        </div>
        
        {/* Navigation Overlays */}
        <MobileProfileLink />
        <MobileNav />
      </ClientAuthGuard>
    </Providers>
  );
}
