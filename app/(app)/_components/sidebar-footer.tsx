"use client";

import Link from "next/link";
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
    <div className="space-y-4">
      <div className="rounded-2xl border border-[rgba(34,99,255,0.16)] bg-white p-5 text-sm text-zinc-600">
        <h3 className="text-base font-semibold text-zinc-900">Tu streak</h3>
        <p className="mt-1">Llevas 4 sesiones esta semana. Manten el ritmo para desbloquear el plan avanzado.</p>
        <Link
          href="/progress"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(34,99,255,0.26)] bg-[#f4f7ff] px-4 py-2 text-xs font-semibold text-[#1c2d5a] transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          Ver progreso
        </Link>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(255,25,16,0.28)] bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
      >
        <LogOut className="h-4.5 w-4.5" />
        {pending ? "Saliendo..." : "Cerrar sesion"}
      </button>
    </div>
  );
}
