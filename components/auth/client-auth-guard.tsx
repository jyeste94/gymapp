"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-hooks";

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Public routes that don't need auth (login, etc.)
        const publicRoutes = ["/login"];
        const isPublic = publicRoutes.some(route => pathname.startsWith(route));

        if (!user && !isPublic) {
            router.replace(`/login?redirect=${pathname}`);
        } else {
            setAuthorized(true);
        }
    }, [user, loading, pathname, router]);

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-white text-sm text-zinc-500">Cargando...</div>;
    }

    // If we are on a protected route and not authorized yet (or redirecting), assume authorized = false unless public
    const publicRoutes = ["/login"];
    const isPublic = publicRoutes.some(route => pathname.startsWith(route));
    if (!user && !isPublic) return null;

    return <>{children}</>;
}
