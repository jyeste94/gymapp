import "@/styles/globals.css";
import Providers from "@/app/providers";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh grid md:grid-cols-[260px_1fr]">
      <aside className="border-r p-4 space-y-2">
        <h2 className="text-lg font-semibold">Fitness</h2>
        <nav className="grid gap-1">
          {[
            ["/", "Dashboard"],
            ["/measurements", "Mediciones"],
            ["/workouts", "Entrenos"],
            ["/routines", "Rutinas"],
            ["/diet", "Dieta"],
            ["/progress", "Progreso"],
            ["/settings", "Ajustes"]
          ].map(([href,label])=>(
            <Link key={href} className="rounded px-2 py-1 hover:bg-zinc-100" href={href as string}>{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="p-4">{children}</main>
    </div>
  );
}
