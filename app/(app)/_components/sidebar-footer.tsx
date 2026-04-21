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
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/14 bg-white/8 px-4 py-2 sf-text-body text-white transition-colors hover:bg-white/14"
      >
        <Settings className="h-4.5 w-4.5" />
        Ajustes
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent px-4 py-2 sf-text-body font-medium text-[#ff453a] transition-colors hover:bg-[#ff453a]/16 disabled:opacity-60"
      >
        <LogOut className="h-4.5 w-4.5" />
        {pending ? "Saliendo..." : "Cerrar sesion"}
      </button>
    </div>
  );
}