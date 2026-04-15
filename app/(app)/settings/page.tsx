"use client";


import { useFirebase } from "@/lib/firebase/client-context";
import { logout } from "@/lib/firebase/auth-actions";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { app } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    if (!app) return;
    try {
      await logout(app);
      toast.success("Sesión cerrada");
      router.push("/login");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <div className="-mx-5 -mt-8 flex min-h-[100dvh] flex-col overflow-hidden bg-brand-dark pb-32 pt-8 font-sans text-brand-text-main md:mx-0 md:mt-0 md:min-h-0 md:h-full md:w-full md:max-w-4xl md:bg-transparent md:pb-8 md:pt-0">
      <div className="flex-1 space-y-6 px-5 pb-24 h-[100dvh] overflow-y-auto md:px-0">
        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text-main">Ajustes</h2>
          <p className="mt-2 text-sm text-brand-text-muted">Personaliza unidades, objetivos y preferencias.</p>

          <div className="mt-6 flex flex-col gap-1">
            <SettingItem label="Perfil y Social" href="/settings/profile" />
            <SettingItem label="Tema claro/oscuro" />
            <SettingItem label="Objetivos calóricos" />
          </div>
        </div>

        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-brand-primary">Sesión</h3>
          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-500/20 active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </span>
            <span>&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

function SettingItem({ label, href }: { label: string; href?: string }) {
  if (href) {
    return (
      <Link href={href} className="flex items-center justify-between rounded-xl p-3 text-sm text-brand-text-main transition hover:bg-brand-dark active:bg-brand-dark/80">
        <span>{label}</span>
        <span className="text-xs text-brand-text-muted">&gt;</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl p-3 text-sm text-brand-text-muted opacity-60">
      <span>{label}</span>
      <span className="text-xs text-brand-text-muted/60">Pronto</span>
    </div>
  );
}


