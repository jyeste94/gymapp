
"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { add } from "@/lib/firestore/crud";
import { useAuth } from "@/lib/firebase/auth-hooks";
import { useFirebase } from "@/lib/firebase/client-context";

const bodyFatSchema = z.preprocess((val) => {
  if (val === "" || val === undefined || val === null) {
    return undefined;
  }
  const num = typeof val === "number" ? val : Number(val);
  return Number.isFinite(num) ? num : val;
}, z.number().min(3).max(70).optional());

const measurementSchema = z.preprocess((val) => {
  if (val === "" || val === undefined || val === null) return undefined;
  const num = typeof val === "number" ? val : Number(val);
  return Number.isFinite(num) ? num : val;
}, z.number().min(5).max(300).optional());

const schema = z.object({
  date: z.string().min(1),
  weightKg: z.coerce.number().min(30).max(300),
  bodyFatPct: bodyFatSchema,
  chest: measurementSchema,
  waist: measurementSchema,
  hips: measurementSchema,
  arm: measurementSchema,
  thigh: measurementSchema,
  calf: measurementSchema,
  notes: z.string().max(200).optional(),
});

type Form = z.infer<typeof schema>;

export default function MeasurementForm() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0, 10) },
  });

  const onSubmit = async (data: Form) => {
    if (!user || !db) return;
    await add(db, `users/${user.uid}/measurements`, {
      ...data,
      id: crypto.randomUUID(),
      date: new Date(data.date).toISOString(),
    });
    reset({ date: new Date().toISOString().slice(0, 10) });
  };

  const firstError =
    (errors?.date?.message ??
      errors?.weightKg?.message ??
      errors?.bodyFatPct?.message ??
      errors?.notes?.message) as string | undefined;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="glass-card grid gap-4 border-[rgba(10,46,92,0.16)] bg-white/80 p-6 md:grid-cols-5"
    >
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Fecha</label>
        <input
          type="date"
          {...register("date")}
          className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Peso (kg)</label>
        <input
          type="number"
          step="0.1"
          {...register("weightKg")}
          className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Grasa (%)</label>
        <input
          type="number"
          step="0.1"
          {...register("bodyFatPct")}
          className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm"
        />
      </div>

      <div className="col-span-full my-2 border-t border-[rgba(10,46,92,0.1)]" />
      <p className="col-span-full text-xs font-semibold text-[#0a2e5c]">Medidas (cm)</p>

      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Pecho</label>
        <input type="number" step="0.5" {...register("chest")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Cintura</label>
        <input type="number" step="0.5" {...register("waist")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Cadera</label>
        <input type="number" step="0.5" {...register("hips")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Brazo</label>
        <input type="number" step="0.5" {...register("arm")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-1">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Muslo</label>
        <input type="number" step="0.5" {...register("thigh")} className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-xs uppercase tracking-[0.3em] text-zinc-400">Notas</label>
        <input
          {...register("notes")}
          className="w-full rounded-2xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-3 py-2 text-sm"
          placeholder="Sue?o, alimentacion, biorritmo..."
        />
      </div>
      <div className="md:col-span-5 flex flex-wrap items-center gap-3">
        <button className="primary-button" disabled={!user || isSubmitting}>
          {user ? (isSubmitting ? "Guardando..." : "Guardar medicion") : "Inicia sesion"}
        </button>
        {firstError && <span className="text-xs text-red-500">{firstError}</span>}
      </div>
    </form>
  );
}
