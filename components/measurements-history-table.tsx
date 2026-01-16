"use client";
import type { Measurement } from "@/lib/types";
import { Trash2, Edit } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" });

const formatValue = (value: number | undefined | null, unit: string = "") => {
  if (value === null || value === undefined) return "-";
  return `${value.toFixed(1)}${unit}`;
};

type Props = {
  measurements: Measurement[];
  loading: boolean;
  onEdit: (measurement: Measurement) => void;
  onDelete: (id: string) => void;
};

export default function MeasurementsHistoryTable({ measurements, loading, onEdit, onDelete }: Props) {
  const hasRows = measurements.length > 0;

  return (
    <div className="overflow-x-auto">
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
            <th className="pb-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(10,46,92,0.18)]">
          {loading && (
            <tr>
              <td colSpan={8} className="py-4 text-center text-[#51607c]">Cargando mediciones...</td>
            </tr>
          )}
          {!loading &&
            measurements.map((row) => (
              <tr key={row.id} className="hover:bg-white/60">
                <td className="py-3 text-[#0a2e5c]">{dateFormatter.format(new Date(row.date))}</td>
                <td className="py-3 font-medium text-zinc-800">{formatValue(row.weightKg, " kg")}</td>
                <td className="py-3 text-[#0a2e5c]">{formatValue(row.bodyFatPct, " %")}</td>
                <td className="hidden py-3 text-[#51607c] md:table-cell">{formatValue(row.chest, " cm")}</td>
                <td className="hidden py-3 text-[#51607c] md:table-cell">{formatValue(row.waist, " cm")}</td>
                <td className="hidden py-3 text-[#51607c] md:table-cell">{formatValue(row.arm, " cm")}</td>
                <td className="py-3 text-[#51607c] truncate max-w-xs">{row.notes ?? ""}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(row)} className="p-1 text-blue-600 hover:bg-blue-100 rounded-full">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(row.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          {!loading && !hasRows && (
            <tr>
              <td colSpan={8} className="py-4 text-center text-[#51607c]">Sin registros todavia.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
