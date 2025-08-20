"use client";
import { useAuth } from "@/lib/firebase/auth-hooks";

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-2xl border p-4">
        <h3 className="font-semibold">Última medición</h3>
        <p className="text-sm text-zinc-600">Sincroniza Firestore aquí…</p>
      </div>
      <div className="rounded-2xl border p-4">
        <h3 className="font-semibold">Kcal del día</h3>
        <p className="text-sm text-zinc-600">Sumatorio de dieta</p>
      </div>
      <div className="rounded-2xl border p-4">
        <h3 className="font-semibold">Próximos entrenos</h3>
      </div>
      <div className="rounded-2xl border p-4">
        <h3 className="font-semibold">Acciones rápidas</h3>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-2">Añadir medición</button>
          <button className="rounded-lg border px-3 py-2">Iniciar entreno</button>
          <button className="rounded-lg border px-3 py-2">Editar dieta</button>
        </div>
      </div>
      <div className="rounded-2xl border p-4 col-span-full">Hola {user?.email ?? "atleta"} 👋</div>
    </div>
  );
}
