import "@/styles/globals.css";
import Providers from "@/app/providers";
import SidebarNav from "@/app/(app)/_components/sidebar-nav";
import SidebarFooter from "@/app/(app)/_components/sidebar-footer";
import MobileNav from "@/app/(app)/_components/mobile-nav";
import MobileProfileLink from "@/app/(app)/_components/mobile-profile-link";
import type { ReactNode } from "react";
import { Dumbbell, Leaf } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import ClientAuthGuard from "@/components/auth/client-auth-guard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ClientAuthGuard>
        <Toaster />
        <div className="min-h-dvh bg-brand-dark">
          <div className="mx-auto flex min-h-dvh max-w-[1400px] flex-col gap-6 px-5 py-8 lg:flex-row lg:px-10">
            <aside className="hidden w-full max-w-[280px] flex-shrink-0 flex-col rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-2xl lg:flex">
              <div className="flex items-center gap-3">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-dark shadow-sm border border-brand-border">
                  <Dumbbell className="h-6 w-6 text-brand-primary" />
                  <Leaf className="absolute -top-1 -right-1 h-4 w-4 text-emerald-300" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-text-muted">Athlos</p>
                  <h2 className="text-lg font-bold text-brand-text-main">Athlos Fit</h2>
                </div>
              </div>

              <SidebarNav />

              <div className="mt-auto">
                <SidebarFooter />
              </div>
            </aside>

            <div className="flex flex-1 flex-col gap-6 pb-24 lg:gap-8 lg:pb-10">
              <main className="flex-1">
                <div className="flex min-h-full flex-col gap-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
        <MobileProfileLink />
        <MobileNav />
      </ClientAuthGuard>
    </Providers>
  );
}
