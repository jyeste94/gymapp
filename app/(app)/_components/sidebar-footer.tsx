"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "firebase/auth";
import { useFirebase } from "@/lib/firebase/client-context";

export default function SidebarFooter() {
  const router = useRouter();
  const { auth } = useFirebase();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (pending || !auth) return;
    try {
      setPending(true);
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("logout failed", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-3">
      <Link
        href="/settings/profile"
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-border bg-brand-dark px-4 py-3 text-sm font-semibold text-brand-text-main shadow-sm transition hover:border-brand-primary/30 hover:text-brand-primary"
      >
        <Settings className="h-4.5 w-4.5" />
        Ajustes
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500 shadow-sm transition hover:bg-red-500/20 hover:border-red-500/30 disabled:opacity-60"
      >
        <LogOut className="h-4.5 w-4.5" />
        {pending ? "Saliendo..." : "Cerrar sesion"}
      </button>
    </div>
  );
}
