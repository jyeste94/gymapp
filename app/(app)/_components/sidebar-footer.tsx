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
    <div className="space-y-1">
      <Link
        href="/settings/profile"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 sf-text-body text-#050505-muted transition-colors hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/8"
      >
        <Settings className="h-[18px] w-[18px]" />
        Ajustes
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 sf-text-body text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-60"
      >
        <LogOut className="h-[18px] w-[18px]" />
        {pending ? "Saliendo..." : "Cerrar sesión"}
      </button>
    </div>
  );
}
