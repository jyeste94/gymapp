"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirebase } from "@/lib/firebase/client-context";
import { addMeasurement, updateMeasurement } from "@/lib/firestore/measurements";
import type { Measurement } from "@/lib/types";
import { useEffect } from "react";
import toast from 'react-hot-toast';
import { measurementFormSchema, type MeasurementFormValues } from "@/lib/validations/measurement";

// Schemas imported from lib/validations/measurement

type FormValues = MeasurementFormValues;

type Props = {
  userId: string | null;
  editingMeasurement: Measurement | null;
  onSuccess: () => void;
};

export default function MeasurementForm({ userId, editingMeasurement, onSuccess }: Props) {
  const { db } = useFirebase();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(measurementFormSchema),
  });

  const isEditing = !!editingMeasurement;

  useEffect(() => {
    if (isEditing) {
      reset({
        date: editingMeasurement.date.slice(0, 10),
        weightKg: editingMeasurement.weightKg,
        bodyFatPct: editingMeasurement.bodyFatPct ?? undefined,
        chest: editingMeasurement.chest ?? undefined,
        waist: editingMeasurement.waist ?? undefined,
        hips: editingMeasurement.hips ?? undefined,
        arm: editingMeasurement.arm ?? undefined,
        thigh: editingMeasurement.thigh ?? undefined,
        calf: editingMeasurement.calf ?? undefined,
        notes: editingMeasurement.notes ?? undefined,
      });
    } else {
      reset({ date: new Date().toISOString().slice(0, 10), weightKg: undefined, bodyFatPct: undefined, notes: '', chest: undefined, waist: undefined, hips: undefined, arm: undefined, thigh: undefined, calf: undefined });
    }
  }, [editingMeasurement, isEditing, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!userId || !db) return;

    const dataToSave = {
      ...data,
      date: new Date(data.date).toISOString(),
    };

    try {
      if (isEditing) {
        await updateMeasurement(db, userId, editingMeasurement.id, dataToSave);
        toast.success("Medición actualizada con éxito");
      } else {
        await addMeasurement(db, userId, dataToSave);
        toast.success("Medición guardada con éxito");
      }
      onSuccess();
    } catch (error) {
      toast.error("Error al guardar la medición.");
      console.error(error);
    }
  };

  const firstError = errors[Object.keys(errors)[0] as keyof typeof errors]?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass-card grid gap-4 border-[rgba(10,46,92,0.16)] bg-white/80 p-6 md:grid-cols-5"
    >
      <div className="col-span-full flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-900">
          {isEditing ? "Editar Medición" : "Registrar Nueva Medición"}
        </h2>
        {isEditing && (
          <button type="button" onClick={onSuccess} className="text-sm font-semibold text-blue-600 hover:underline">
            Cancelar
          </button>
        )}
      </div>

      {/* Campos del formulario (sin cambios en el JSX, solo en la logica) */}
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Fecha</label>
        <input type="date" {...register("date")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Peso (kg)</label>
        <input type="text" inputMode="decimal" {...register("weightKg")} placeholder="0.0" className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Grasa (%)</label>
        <input type="text" inputMode="decimal" {...register("bodyFatPct")} placeholder="0.0" className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>

      <div className="col-span-full my-2 border-t border-[rgba(10,46,92,0.1)]" />
      <p className="col-span-full text-xs font-semibold text-[#0a2e5c]">Medidas (cm)</p>

      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Pecho</label>
        <input type="text" inputMode="decimal" {...register("chest")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Cintura</label>
        <input type="text" inputMode="decimal" {...register("waist")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Cadera</label>
        <input type="text" inputMode="decimal" {...register("hips")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Brazo</label>
        <input type="text" inputMode="decimal" {...register("arm")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Muslo</label>
        <input type="text" inputMode="decimal" {...register("thigh")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Notas</label>
        <input {...register("notes")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" placeholder="Sueño, alimentación, biorritmo..." />
      </div>
      <div className="md:col-span-5 flex flex-wrap items-center gap-3">
        <button className="primary-button" disabled={!userId || isSubmitting}>
          {isSubmitting ? "Guardando..." : (isEditing ? "Actualizar Medición" : "Guardar Medición")}
        </button>
        {firstError && <span className="text-xs text-red-500">{String(firstError)}</span>}
      </div>
    </form>
  );
}
