"use client";
import { useState, useEffect } from "react";
import type { Measurement } from "@/lib/types";
import { NutriFlowClient } from "@/lib/api/nutriflow";

function apiToMeasurement(api: { id: string; date: string; weight_kg: number; body_fat_pct?: number | null; chest_cm?: number | null; waist_cm?: number | null; hips_cm?: number | null; arm_cm?: number | null; thigh_cm?: number | null; calf_cm?: number | null; notes?: string | null }): Measurement {
  return {
    id: api.id,
    date: api.date,
    weightKg: api.weight_kg,
    bodyFatPct: api.body_fat_pct ?? null,
    chest: api.chest_cm ?? null,
    waist: api.waist_cm ?? null,
    hips: api.hips_cm ?? null,
    arm: api.arm_cm ?? null,
    thigh: api.thigh_cm ?? null,
    calf: api.calf_cm ?? null,
    notes: api.notes ?? null,
  };
}

function measurementToApi(data: Omit<Measurement, "id">): {
  date: string; weight_kg: number; body_fat_pct?: number;
  chest_cm?: number; waist_cm?: number; hips_cm?: number;
  arm_cm?: number; thigh_cm?: number; calf_cm?: number;
  notes?: string;
} {
  return {
    date: data.date,
    weight_kg: data.weightKg,
    body_fat_pct: data.bodyFatPct ?? undefined,
    chest_cm: data.chest ?? undefined,
    waist_cm: data.waist ?? undefined,
    hips_cm: data.hips ?? undefined,
    arm_cm: data.arm ?? undefined,
    thigh_cm: data.thigh ?? undefined,
    calf_cm: data.calf ?? undefined,
    notes: data.notes ?? undefined,
  };
}

export const useMeasurements = (_db: unknown, _userId?: string | null) => {
  void _db; void _userId;
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMeasurements = async () => {
      setLoading(true);
      try {
        const data = await NutriFlowClient.listMeasurements({ limit: 200 });
        if (!cancelled) {
          setMeasurements(data.map(apiToMeasurement));
        }
      } catch (error) {
        console.error("Error loading measurements from API", error);
        if (!cancelled) setMeasurements([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMeasurements();
    return () => { cancelled = true; };
  }, []);

  return { data: measurements, loading };
};

export const addMeasurement = async (_db: unknown, _userId: string, data: Omit<Measurement, "id">) => {
  const result = await NutriFlowClient.createMeasurement(measurementToApi(data));
  return result.id;
};

export const updateMeasurement = async (_db: unknown, _userId: string, measurementId: string, data: Partial<Omit<Measurement, "id">>) => {
  const payload: Record<string, unknown> = {};
  if (data.date !== undefined) payload.date = data.date;
  if (data.weightKg !== undefined) payload.weight_kg = data.weightKg;
  if (data.bodyFatPct !== undefined) payload.body_fat_pct = data.bodyFatPct;
  if (data.chest !== undefined) payload.chest_cm = data.chest;
  if (data.waist !== undefined) payload.waist_cm = data.waist;
  if (data.hips !== undefined) payload.hips_cm = data.hips;
  if (data.arm !== undefined) payload.arm_cm = data.arm;
  if (data.thigh !== undefined) payload.thigh_cm = data.thigh;
  if (data.calf !== undefined) payload.calf_cm = data.calf;
  if (data.notes !== undefined) payload.notes = data.notes;
  await NutriFlowClient.updateMeasurement(measurementId, payload);
};

export const deleteMeasurement = async (_db: unknown, _userId: string, measurementId: string) => {
  await NutriFlowClient.deleteMeasurement(measurementId);
};
