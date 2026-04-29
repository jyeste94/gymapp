import "@/styles/globals.css";
import Providers from "@/app/providers";
import SidebarNav from "@/app/(app)/_components/sidebar-nav";
import SidebarFooter from "@/app/(app)/_components/sidebar-footer";
import MobileNav from "@/app/(app)/_components/mobile-nav";
import type { ReactNode } from "react";
import { Utensils } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import ClientAuthGuard from "@/components/auth/client-auth-guard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ClientAuthGuard>
        <Toaster
          toastOptions={{
            style: { background: '#ffffff', color: '#1a1a2e', border: '1px solid #e5e7eb', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', borderRadius: '16px' },
          }}
        />
        <div className="relative min-h-dvh bg-fitia-bg dark:bg-[#0f0f1a] font-sans">
          <div className="relative mx-auto flex min-h-dvh max-w-[1400px] flex-col gap-0 lg:flex-row">
            {/* Sidebar - Fitia style */}
            <aside className="sticky top-0 hidden h-dvh w-[260px] flex-shrink-0 flex-col border-r border-fitia-border bg-white px-4 py-6 lg:flex dark:border-white/10 dark:bg-[#16162a]">
              <div className="mb-8 flex items-center gap-2.5 px-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fitia-yellow text-white">
                  <Utensils className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-fitia-text dark:text-white">Athlos</span>
              </div>
              <SidebarNav />
              <div className="mt-auto pt-4 border-t border-fitia-border dark:border-white/10">
                <SidebarFooter />
              </div>
            </aside>

            <div className="flex flex-1 flex-col min-h-dvh pb-24 lg:pb-0">
              <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {children}
              </main>
            </div>
          </div>
        </div>
        <MobileNav />
      </ClientAuthGuard>
    </Providers>
  );
}
