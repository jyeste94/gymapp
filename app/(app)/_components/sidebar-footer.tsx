"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/firebase/auth-hooks";

export default function SidebarFooter() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (pending) return;
    try {
      setPending(true);
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("logout failed", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ff1910]/30 bg-white px-4 py-3 text-sm font-semibold text-[#0a2e5c] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
      >
        <LogOut className="h-4.5 w-4.5" />
        {pending ? "Saliendo..." : "Cerrar sesion"}
      </button>
    </div>
  );
}
