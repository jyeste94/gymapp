import "@/styles/globals.css";
import Providers from "@/app/providers";
import { Toaster } from 'react-hot-toast';
import ClientAuthGuard from "@/components/auth/client-auth-guard";
import { DrawerMenu } from "@/components/nutri-components";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ClientAuthGuard>
        <Toaster />
        <div className="min-h-dvh bg-background">
          <DrawerMenu />
          <main className="mx-auto max-w-md px-4 py-6">
            {children}
          </main>
        </div>
      </ClientAuthGuard>
    </Providers>
  );
}
