"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { add } from "@/lib/firestore/crud";
import { useAuth } from "@/lib/firebase/auth-hooks";

const schema = z.object({
  date: z.string().min(1),
  weightKg: z.coerce.number().min(30).max(300),
  bodyFatPct: z.coerce.number().min(3).max(70).optional(),
  notes: z.string().max(200).optional(),
});
type Form = z.infer<typeof schema>;

export default function MeasurementForm() {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState:{errors} } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { date: new Date().toISOString().slice(0,10) }
  });

  const onSubmit = async (data: Form) => {
    if (!user) return;
    await add(`users/${user.uid}/measurements`, { ...data, id: crypto.randomUUID(), date: new Date(data.date).toISOString() });
    reset({ date: new Date().toISOString().slice(0,10) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border p-4 grid gap-3 md:grid-cols-4">
      <div><label className="text-sm">Fecha</label><input type="date" {...register("date")} className="w-full border rounded px-3 py-2"/></div>
      <div><label className="text-sm">Peso (kg)</label><input type="number" step="0.1" {...register("weightKg")} className="w-full border rounded px-3 py-2"/></div>
      <div><label className="text-sm">% Grasa</label><input type="number" step="0.1" {...register("bodyFatPct")} className="w-full border rounded px-3 py-2"/></div>
      <div className="md:col-span-4"><label className="text-sm">Notas</label><input {...register("notes")} className="w-full border rounded px-3 py-2"/></div>
      <div className="md:col-span-4 flex gap-2">
        <button className="rounded-lg border px-3 py-2">Guardar</button>
        <span className="text-red-600 text-sm">{Object.values(errors)[0]?.message as string}</span>
      </div>
    </form>
  );
}
