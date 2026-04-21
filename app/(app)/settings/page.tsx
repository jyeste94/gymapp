"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronRight } from "lucide-react";
import { logout } from "@/lib/firebase/auth-actions";
import { useFirebase } from "@/lib/firebase/client-context";

export default function SettingsPage() {
  const { app } = useFirebase();
  const router = useRouter();

  const handleLogout = async () => {
    if (!app) return;
    try {
      await logout(app);
      toast.success("Sesion cerrada");
      router.push("/login");
    } catch {
      toast.error("Error al cerrar sesion");
    }
  };

  return (
    <div className="apple-page-shell max-w-3xl space-y-8">
      <header>
        <p className="apple-kicker">Ajustes</p>
        <h1 className="sf-display-section text-apple-near-black dark:text-white">Cuenta y preferencias</h1>
      </header>

      <div className="space-y-8">
        <section className="apple-panel overflow-hidden rounded-2xl p-0">
          <div className="border-b border-apple-near-black/5 px-5 py-4 dark:border-white/5">
            <h2 className="sf-text-body-strong text-apple-near-black dark:text-white">Cuenta</h2>
            <p className="mt-1 sf-text-caption text-apple-near-black/60 dark:text-white/60">Personaliza perfil, unidades y objetivos.</p>
          </div>
          <div className="flex flex-col px-5">
            <SettingItem label="Perfil y social" href="/settings/profile" />
            <SettingItem label="Tema claro/oscuro" />
            <SettingItem label="Objetivos caloricos" />
          </div>
        </section>

        <section className="apple-panel overflow-hidden rounded-2xl p-0">
          <div className="border-b border-apple-near-black/5 px-5 py-4 dark:border-white/5">
            <h2 className="sf-text-body-strong text-apple-near-black dark:text-white">Sesion</h2>
          </div>
          <div className="px-5 py-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded bg-transparent py-3 sf-text-body text-[#ff3b30] outline-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-apple-blue"
            >
              <span>Cerrar sesion</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingItem({ label, href }: { label: string; href?: string }) {
  if (href) {
    return (
      <Link
        href={href}
        className="group flex items-center justify-between border-b border-apple-near-black/5 py-3.5 sf-text-body text-apple-near-black outline-none last:border-0 focus-visible:bg-apple-blue/5 dark:border-white/5 dark:text-white"
      >
        <span>{label}</span>
        <ChevronRight className="h-5 w-5 text-apple-near-black/30 transition-colors group-hover:text-apple-blue dark:text-white/30" />
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between border-b border-apple-near-black/5 py-3.5 sf-text-body text-apple-near-black/50 last:border-0 dark:border-white/5 dark:text-white/50">
      <span>{label}</span>
      <span className="sf-text-micro text-apple-near-black/40 dark:text-white/40">Pronto</span>
    </div>
  );
}
