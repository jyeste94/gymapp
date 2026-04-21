"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Activity, TrendingUp } from "lucide-react";
import MeasurementForm from "@/components/measurement-form";
import MeasurementChart from "@/components/measurement-chart";
import MeasurementsHistoryTable from "@/components/measurements-history-table";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import { deleteMeasurement, useMeasurements } from "@/lib/firestore/measurements";
import type { Measurement } from "@/lib/types";

export default function MeasurementsPage() {
  const { user } = useAuth();
  const { db } = useFirebase();

  const { data: measurements, loading } = useMeasurements(db, user?.uid ?? null);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);

  const handleEdit = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!user || !db) return;
    if (confirm("Seguro que quieres eliminar esta medicion?")) {
      try {
        await deleteMeasurement(db, user.uid, id);
        toast.success("Medicion eliminada con exito", {
          style: {
            background: "#ffffff",
            color: "#1d1d1f",
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          },
        });
      } catch (error) {
        toast.error("Error al eliminar la medicion", {
          style: {
            background: "#ffffff",
            color: "#ff3b30",
            border: "1px solid rgba(255,59,48,0.2)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          },
        });
        console.error(error);
      }
    }
  };

  const chartData = useMemo(() => [...measurements].reverse(), [measurements]);

  return (
    <div className="apple-page-shell space-y-8">
      <header className="mb-8 flex flex-col gap-2">
        <p className="apple-kicker">Mediciones</p>
        <h1 className="sf-display-hero text-apple-near-black dark:text-white">Control de metricas</h1>
        <p className="max-w-xl sf-text-subnav text-apple-near-black/60 dark:text-white/60">
          Lo que no se mide, no se puede mejorar. Registra peso, grasa y perimetros.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-1">
          <section className="apple-panel p-6">
            <MeasurementForm userId={user?.uid ?? null} editingMeasurement={editingMeasurement} onSuccess={() => setEditingMeasurement(null)} />
          </section>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <section className="apple-panel flex flex-col p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-apple-blue/10 text-apple-blue">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">Tendencia de peso</h3>
                  <p className="sf-text-caption text-apple-near-black/50 dark:text-white/50">Evolucion de tus ultimas mediciones</p>
                </div>
              </div>
            </div>
            <div className="min-h-[300px] flex-1 rounded-3xl bg-apple-gray p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
              <MeasurementChart data={chartData} />
            </div>
          </section>

          <section className="apple-panel p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-apple-gray text-apple-blue shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:bg-apple-surface-2">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="sf-text-body-strong text-apple-near-black dark:text-white">Historico registrado</h3>
                  <p className="sf-text-caption text-apple-near-black/50 dark:text-white/50">Todos tus pesajes guardados</p>
                </div>
              </div>
            </div>

            {!user ? (
              <div className="rounded-3xl bg-apple-gray p-8 text-center sf-text-body text-apple-near-black/50 dark:bg-apple-surface-2 dark:text-white/50">
                Inicia sesion para sincronizar y ver tus registros.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-apple-near-black/5 bg-apple-gray shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-apple-surface-2">
                <MeasurementsHistoryTable
                  measurements={measurements}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
