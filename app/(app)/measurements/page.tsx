"use client";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useCol } from "@/lib/firestore/hooks";
import type { Measurement } from "@/lib/types";
import MeasurementForm from "@/components/measurement-form";
import MeasurementChart from "@/components/measurement-chart";

export default function MeasurementsPage() {
  const { user } = useAuth();
  const uid = user?.uid ?? "_";
  const { data: rows } = useCol<Measurement>(`users/${uid}/measurements`, { by: "date", dir: "desc" });

  return (
    <div className="space-y-6">
      <MeasurementForm />
      <div className="rounded-2xl border p-4">
        <h3 className="font-semibold mb-2">Histórico</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">Fecha</th><th>Peso</th><th>% Grasa</th><th>Notas</th></tr></thead>
            <tbody>
              {rows?.map(r=>(
                <tr key={r.id} className="border-t">
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.weightKg.toFixed(1)} kg</td>
                  <td>{r.bodyFatPct ?? "-"}</td>
                  <td>{r.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <MeasurementChart data={rows ?? []} />
    </div>
  );
}
