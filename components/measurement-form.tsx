"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirebase } from "@/lib/firebase/client-context";
import { addMeasurement, updateMeasurement } from "@/lib/firestore/measurements";
import type { Measurement } from "@/lib/types";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { measurementFormSchema, type MeasurementFormValues } from "@/lib/validations/measurement";

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
      reset({
        date: new Date().toISOString().slice(0, 10),
        weightKg: undefined,
        bodyFatPct: undefined,
        notes: "",
        chest: undefined,
        waist: undefined,
        hips: undefined,
        arm: undefined,
        thigh: undefined,
        calf: undefined,
      });
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
        toast.success("Medicion actualizada");
      } else {
        await addMeasurement(db, userId, dataToSave);
        toast.success("Medicion guardada");
      }
      onSuccess();
    } catch (error) {
      toast.error("Error al guardar la medicion.");
      console.error(error);
    }
  };

  const firstError = errors[Object.keys(errors)[0] as keyof typeof errors]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-5">
      <div className="col-span-full flex items-center justify-between">
        <h2 className="sf-display-card-title text-apple-near-black dark:text-white">
          {isEditing ? "Editar medicion" : "Registrar medicion"}
        </h2>
        {isEditing && (
          <button type="button" onClick={onSuccess} className="apple-link">
            Cancelar
          </button>
        )}
      </div>

      <div className="space-y-2 md:col-span-1">
        <label className="apple-kicker">Fecha</label>
        <input type="date" {...register("date")} className="w-full" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="apple-kicker">Peso (kg)</label>
        <input type="text" inputMode="decimal" {...register("weightKg")} placeholder="0.0" className="w-full" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="apple-kicker">Grasa (%)</label>
        <input type="text" inputMode="decimal" {...register("bodyFatPct")} placeholder="0.0" className="w-full" />
      </div>

      <div className="col-span-full apple-divider my-2" />
      <p className="col-span-full sf-text-caption-strong text-apple-near-black dark:text-white">Medidas (cm)</p>

      <div className="space-y-2 md:col-span-1">
        <label className="apple-kicker">Pecho</label>
        <input type="text" inputMode="decimal" {...register("chest")} className="w-full" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="apple-kicker">Cintura</label>
        <input type="text" inputMode="decimal" {...register("waist")} className="w-full" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="apple-kicker">Cadera</label>
        <input type="text" inputMode="decimal" {...register("hips")} className="w-full" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="apple-kicker">Brazo</label>
        <input type="text" inputMode="decimal" {...register("arm")} className="w-full" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="apple-kicker">Muslo</label>
        <input type="text" inputMode="decimal" {...register("thigh")} className="w-full" />
      </div>
      <div className="space-y-2 md:col-span-5">
        <label className="apple-kicker">Notas</label>
        <input {...register("notes")} className="w-full" placeholder="Sueno, alimentacion, biorritmo..." />
      </div>

      <div className="md:col-span-5 flex flex-wrap items-center gap-3 pt-2">
        <button className="btn-apple-primary" disabled={!userId || isSubmitting}>
          {isSubmitting ? "Guardando..." : isEditing ? "Actualizar medicion" : "Guardar medicion"}
        </button>
        {firstError && <span className="sf-text-caption text-[#ff3b30]">{String(firstError)}</span>}
      </div>
    </form>
  );
}