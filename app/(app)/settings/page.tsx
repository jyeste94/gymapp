"use client";

import { useAuth } from "@/lib/firebase/auth-hooks";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada");
      router.push("/login");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Ajustes</h2>
        <p className="mt-2 text-sm text-[#4b5a72]">Personaliza unidades, objetivos y preferencias.</p>

        <div className="mt-6 flex flex-col gap-1">
          <SettingItem label="Perfil y unidades" />
          <SettingItem label="Tema claro/oscuro" />
          <SettingItem label="Objetivos calóricos" />
        </div>
      </div>

      <div className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <h3 className="text-sm font-semibold text-[#0a2e5c]">Sesión</h3>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </span>
          <span>&gt;</span>
        </button>
      </div>
    </div>
  );
}

function SettingItem({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl p-3 text-sm text-[#4b5a72] transition hover:bg-slate-50">
      <span>{label}</span>
      <span className="text-xs text-slate-400">Pronto</span>
    </div>
  );
}


