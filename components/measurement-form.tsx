"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { add } from "@/lib/firestore/crud";
import { useAuth } from "@/lib/firebase/auth-hooks";

const bodyFatSchema = z.preprocess((val) => {
  if (val === "" || val === undefined || val === null) {
    return undefined;
  }
  const num = typeof val === "number" ? val : Number(val);
  return Number.isFinite(num) ? num : val;
}, z.number().min(3).max(70).optional());

const schema = z.object({
  date: z.string().min(1),
  weightKg: z.coerce.number().min(30).max(300),
  bodyFatPct: bodyFatSchema,
  notes: z.string().max(200).optional(),
});

type Form = z.infer<typeof schema>;

export default function MeasurementForm() {
  const { user } = useAuth();
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
    if (!user) return;
    await add(`users/${user.uid}/measurements`, {
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

