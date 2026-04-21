"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const publicRoutes = ["/login"];
    const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

    if (!user && !isPublic) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-apple-gray px-5 dark:bg-black">
        <div className="apple-panel w-full max-w-sm text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-apple-near-black/20 border-t-apple-blue dark:border-white/20" />
          <p className="mt-3 sf-text-caption text-apple-near-black/60 dark:text-white/60">Cargando...</p>
        </div>
      </div>
    );
  }

  const publicRoutes = ["/login"];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  if (!user && !isPublic) return null;

  return <>{children}</>;
}
