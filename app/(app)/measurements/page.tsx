"use client";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import type { Measurement } from "@/lib/types";
import MeasurementForm from "@/components/measurement-form";
import MeasurementChart from "@/components/measurement-chart";

export default function MeasurementsPage() {
  const { user } = useAuth();
  const path = user?.uid ? `users/${user.uid}/measurements` : null;
  const { data: rows, loading } = useCol<Measurement>(path, { by: "date", dir: "desc" });
  const hasRows = rows.length > 0;

  return (
    <div className="space-y-6">
      <MeasurementForm />

      <div className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Historico</p>
            <h3 className="text-lg font-semibold text-zinc-900">Registro de mediciones</h3>
          </div>
        </div>
        {!user && <p className="mt-4 text-sm text-[#51607c]">Inicia sesion para ver y sincronizar tus registros.</p>}
        {user && (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-sm text-[#4b5a72]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.3em] text-zinc-400">
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Peso</th>
                  <th className="pb-3">Grasa</th>
                  <th className="hidden pb-3 md:table-cell">Pecho</th>
                  <th className="hidden pb-3 md:table-cell">Cintura</th>
                  <th className="hidden pb-3 md:table-cell">Brazo</th>
                  <th className="pb-3">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(10,46,92,0.18)]">
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-[#51607c]">Cargando mediciones...</td>
                  </tr>
                )}
                {!loading &&
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/60">
                      <td className="py-3 text-[#0a2e5c]">{new Date(row.date).toLocaleDateString()}</td>
                      <td className="py-3 font-medium text-zinc-800">{row.weightKg.toFixed(1)} kg</td>
                      <td className="py-3 text-[#0a2e5c]">{row.bodyFatPct ?? "-"}</td>
                      <td className="hidden py-3 text-[#51607c] md:table-cell">{row.chest ?? "-"}</td>
                      <td className="hidden py-3 text-[#51607c] md:table-cell">{row.waist ?? "-"}</td>
                      <td className="hidden py-3 text-[#51607c] md:table-cell">{row.arm ?? "-"}</td>
                      <td className="py-3 text-[#51607c]">{row.notes ?? ""}</td>
                    </tr>
                  ))}
                {!loading && !hasRows && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-[#51607c]">Sin registros todavia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <h3 className="text-lg font-semibold text-zinc-900">Tendencia de peso</h3>
        <p className="text-sm text-[#51607c]">Visualiza la evolucion de tus mediciones.</p>
        <div className="mt-4">
          <MeasurementChart data={user ? rows : []} />
        </div>
      </div>
    </div>
  );
}


