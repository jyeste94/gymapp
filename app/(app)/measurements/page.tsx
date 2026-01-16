"use client";
import { useState, useMemo } from "react";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import { useMeasurements, deleteMeasurement } from "@/lib/firestore/measurements";
import type { Measurement } from "@/lib/types";
import MeasurementForm from "@/components/measurement-form";
import MeasurementChart from "@/components/measurement-chart";
import MeasurementsHistoryTable from "@/components/measurements-history-table";
import toast from 'react-hot-toast';

export default function MeasurementsPage() {
  const { user } = useAuth();
  const { db } = useFirebase();
  
  // Obtenemos las mediciones con el nuevo hook
  const { data: measurements, loading } = useMeasurements(db, user?.uid ?? null);
  
  // Estado para la medicion que se esta editando
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);

  const handleEdit = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!user || !db) return;
    if (confirm("¿Estás seguro de que quieres eliminar esta medición?")) {
      try {
        await deleteMeasurement(db, user.uid, id);
        toast.success("Medición eliminada con éxito");
      } catch (error) {
        toast.error("Error al eliminar la medición");
        console.error(error);
      }
    }
  };

  const handleFormSuccess = () => {
    setEditingMeasurement(null);
  };
  
  // Invertimos los datos para la grafica
  const chartData = useMemo(() => [...measurements].reverse(), [measurements]);

  return (
    <div className="space-y-6">
      {/* Pasamos los props necesarios al formulario */}
      <MeasurementForm
        userId={user?.uid ?? null}
        editingMeasurement={editingMeasurement}
        onSuccess={handleFormSuccess}
      />

      <div className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Histórico</p>
            <h3 className="text-lg font-semibold text-zinc-900">Registro de mediciones</h3>
          </div>
        </div>
        {!user && <p className="mt-4 text-sm text-[#51607c]">Inicia sesión para ver y sincronizar tus registros.</p>}
        {user && (
          <MeasurementsHistoryTable
            measurements={measurements}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <div className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
        <h3 className="text-lg font-semibold text-zinc-900">Tendencia de peso</h3>
        <p className="text-sm text-[#51607c]">Visualiza la evolución de tus mediciones.</p>
        <div className="mt-4">
          <MeasurementChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
