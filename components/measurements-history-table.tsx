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
      <table className="min-w-full sf-text-caption text-apple-near-black/72 dark:text-white/72">
        <thead>
          <tr className="apple-kicker text-left">
            <th className="pb-3">Fecha</th>
            <th className="pb-3">Peso</th>
            <th className="pb-3">Grasa</th>
            <th className="hidden pb-3 md:table-cell">Pecho</th>
            <th className="hidden pb-3 md:table-cell">Cintura</th>
            <th className="hidden pb-3 md:table-cell">Brazo</th>
            <th className="pb-3">Notas</th>
            <th className="pb-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-apple-near-black/12 dark:divide-white/10">
          {loading && (
            <tr>
              <td colSpan={8} className="py-4 text-center sf-text-body text-apple-near-black/60 dark:text-white/60">
                Cargando mediciones...
              </td>
            </tr>
          )}
          {!loading &&
            measurements.map((row) => (
              <tr key={row.id} className="hover:bg-white/70 dark:hover:bg-apple-surface-1/45">
                <td className="py-3 sf-text-caption-strong text-apple-near-black dark:text-white">{dateFormatter.format(new Date(row.date))}</td>
                <td className="py-3 sf-text-caption-strong text-apple-near-black dark:text-white">{formatValue(row.weightKg, " kg")}</td>
                <td className="py-3">{formatValue(row.bodyFatPct, " %")}</td>
                <td className="hidden py-3 md:table-cell">{formatValue(row.chest, " cm")}</td>
                <td className="hidden py-3 md:table-cell">{formatValue(row.waist, " cm")}</td>
                <td className="hidden py-3 md:table-cell">{formatValue(row.arm, " cm")}</td>
                <td className="max-w-xs truncate py-3">{row.notes ?? ""}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(row)} className="rounded-full p-1.5 text-apple-blue transition hover:bg-apple-blue/12" aria-label="Editar">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(row.id)} className="rounded-full p-1.5 text-[#ff3b30] transition hover:bg-[#ff3b30]/12" aria-label="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          {!loading && !hasRows && (
            <tr>
              <td colSpan={8} className="py-4 text-center sf-text-body text-apple-near-black/60 dark:text-white/60">
                Sin registros todavia.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}