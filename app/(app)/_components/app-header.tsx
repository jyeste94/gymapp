"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { navItems } from "@/app/(app)/_components/nav-items";

export default function AppHeader() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const originalOverflow = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open, mounted]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const portalTarget = mounted ? document.body : null;

  const drawer = (
    <div
      className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm md:hidden"
      onClick={handleClose}
    >
      <div
        className="absolute inset-y-0 right-0 flex w-72 flex-col gap-6 bg-white/95 px-5 py-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-700">Navegacion</span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(34,99,255,0.24)] bg-white/80 text-zinc-500"
            onClick={handleClose}
            aria-label="Cerrar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleClose}
              className={clsx(
                "flex items-center gap-3 rounded-2xl border border-[rgba(34,99,255,0.18)] bg-white px-4 py-3 text-sm font-medium text-zinc-600 shadow-sm"
              )}
            >
              <item.icon className="h-4 w-4 text-zinc-500" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative glass-card border-[rgba(34,99,255,0.16)] bg-white/80 px-4 py-5 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Dashboard personal</p>
            <h1 className="text-xl font-semibold text-zinc-900">Bienvenido de nuevo</h1>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button className="secondary-button">Planificar semana</button>
            <button className="primary-button">Nueva sesion</button>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(34,99,255,0.24)] bg-white/80 text-zinc-500"
            onClick={handleOpen}
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 md:hidden">
          <button className="secondary-button flex-1 justify-center">Plan semana</button>
          <button className="primary-button flex-1 justify-center">Nueva sesion</button>
        </div>
      </div>
      {open && portalTarget ? createPortal(drawer, portalTarget) : null}
    </>
  );
}
