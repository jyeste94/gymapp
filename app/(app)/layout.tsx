import "@/styles/globals.css";
import Providers from "@/app/providers";
import SidebarNav from "@/app/(app)/_components/sidebar-nav";
import SidebarFooter from "@/app/(app)/_components/sidebar-footer";
import MobileNav from "@/app/(app)/_components/mobile-nav";
import type { ReactNode } from "react";
import { Dumbbell } from "lucide-react";
import { Toaster } from 'react-hot-toast';
import ClientAuthGuard from "@/components/auth/client-auth-guard";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ClientAuthGuard>
        <Toaster />
        <div className="relative min-h-dvh overflow-x-hidden bg-apple-gray dark:bg-apple-black font-sans selection:bg-apple-blue selection:text-white">
          <div className="relative mx-auto flex min-h-dvh max-w-[1500px] flex-col gap-6 px-4 py-8 lg:flex-row lg:px-8 lg:py-10">
            <aside className="apple-glass-nav sticky top-8 hidden h-[calc(100dvh-4rem)] w-full max-w-[286px] flex-shrink-0 flex-col rounded-[20px] border border-white/10 p-6 text-white shadow-apple-card lg:flex">
              <div className="mb-6 flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-apple-black">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[21px] font-semibold leading-tight tracking-tight text-white">Athlos Fit</h2>
                </div>
              </div>

              <SidebarNav />

              <div className="mt-auto pt-6 apple-divider">
                <SidebarFooter />
              </div>
            </aside>

            <div className="flex flex-1 flex-col pb-8 pt-6 sm:pb-10 sm:pt-8 lg:pb-0 lg:pt-0">
              <main className="flex-1">
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
