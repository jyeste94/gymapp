"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";
import { useMeasurements, deleteMeasurement } from "@/lib/firestore/measurements";
import type { Measurement } from "@/lib/types";
import MeasurementForm from "@/components/measurement-form";
import MeasurementChart from "@/components/measurement-chart";
import MeasurementsHistoryTable from "@/components/measurements-history-table";
import toast from 'react-hot-toast';
import { Activity, TrendingUp } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

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
    if (confirm("¿Estás seguro de que quieres eliminar esta medición?")) {
      try {
        await deleteMeasurement(db, user.uid, id);
        toast.success("Medición eliminada con éxito", {
          style: { background: '#141720', color: '#3ee07f', border: '1px solid rgba(62,224,127,0.3)' }
        });
      } catch (error) {
        toast.error("Error al eliminar la medición", {
          style: { background: '#141720', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
        });
        console.error(error);
      }
    }
  };

  const handleFormSuccess = () => {
    setEditingMeasurement(null);
  };

  const chartData = useMemo(() => [...measurements].reverse(), [measurements]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen pb-32 pt-6 lg:pb-12"
    >
      <div className="relative z-10 space-y-8 px-5 lg:px-0">
        
        <header className="flex flex-col gap-2">
          <h1 className="font-bebas text-4xl uppercase text-brand-text-main md:text-5xl">
            Control de <span className="text-brand-primary text-glow-primary">Métricas</span>
          </h1>
          <p className="text-sm text-brand-text-muted max-w-xl">
            Lo que no se mide, no se puede mejorar. Registra tu peso, grasa y medidas corporales.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-1">
            <motion.div variants={itemVariants} className="glass-card rounded-4xl p-6">
              <MeasurementForm
                userId={user?.uid ?? null}
                editingMeasurement={editingMeasurement}
                onSuccess={handleFormSuccess}
              />
            </motion.div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <motion.section variants={itemVariants} className="glass-card rounded-4xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-text-main">Tendencia de Peso</h3>
                    <p className="text-xs text-brand-text-muted">Evolución de tus últimas mediciones</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-brand-dark/50 border border-brand-border/50 p-4">
                <MeasurementChart data={chartData} />
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="glass-card rounded-4xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-dark border border-brand-border text-brand-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-text-main">Histórico Registrado</h3>
                    <p className="text-xs text-brand-text-muted">Todos tus pesajes guardados</p>
                  </div>
                </div>
              </div>
              
              {!user ? (
                <div className="rounded-2xl border border-dashed border-brand-border bg-brand-dark/30 p-8 text-center text-sm text-brand-text-muted">
                  Inicia sesión para sincronizar y ver tus registros.
                </div>
              ) : (
                <div className="rounded-2xl border border-brand-border/50 bg-brand-dark/30 overflow-hidden">
                  <MeasurementsHistoryTable
                    measurements={measurements}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

