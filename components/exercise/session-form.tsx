import clsx from "clsx";
import type { SessionState } from "./types";
import MediaField from "@/components/ui/media-field";

type SessionFormProps = {
  session: SessionState;
  setSession: React.Dispatch<React.SetStateAction<SessionState>>;
  handleSave: () => void;
  isSaving: boolean;
  userId?: string;
  addExtraSet: () => void;
  removeLastSet: () => void;
  toggleSetCompleted: (index: number) => void;
  handleSetField: (index: number, field: "weight" | "reps" | "rir") => (value: string) => void;
};

export default function SessionForm({
  session,
  setSession,
  handleSave,
  isSaving,
  userId,
  addExtraSet,
  removeLastSet,
  toggleSetCompleted,
  handleSetField,
}: SessionFormProps) {
  return (
    <section className="rounded-2xl border bg-white/70 p-6 shadow-sm">
      <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-[#51607c]">Fecha y hora</label>
            <input
              type="datetime-local"
              value={session.sessionDate}
              onChange={(event) => setSession((prev) => ({ ...prev, sessionDate: event.target.value }))}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[#51607c]">Esfuerzo percibido (RPE)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={session.perceivedEffort}
              onChange={(event) => setSession((prev) => ({ ...prev, perceivedEffort: event.target.value }))}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          {session.sets.map((set, index) => (
            <div key={index} className="rounded-2xl border border-[rgba(10,46,92,0.18)] bg-white/80 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-[#51607c]">
                <span>Serie {index + 1}</span>
                <button
                  type="button"
                  onClick={() => toggleSetCompleted(index)}
                  className={clsx(
                    "rounded-full px-2 py-0.5",
                    set.completed
                      ? "bg-[#0a2e5c] text-white"
                      : "border border-[rgba(10,46,92,0.26)] bg-white/80 text-[#51607c]"
                  )}
                >
                  {set.completed ? "Completada" : "Pendiente"}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <input
                  type="number"
                  placeholder="Kg"
                  value={set.weight}
                  onChange={(event) => handleSetField(index, "weight")(event.target.value)}
                  className="w-full rounded-xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-2 py-1"
                  min="0"
                  step="0.5"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={set.reps}
                  onChange={(event) => handleSetField(index, "reps")(event.target.value)}
                  className="w-full rounded-xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-2 py-1"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="RIR"
                  value={set.rir}
                  onChange={(event) => handleSetField(index, "rir")(event.target.value)}
                  className="w-full rounded-xl border border-[rgba(10,46,92,0.26)] bg-white/90 px-2 py-1"
                  min="0"
                  max="5"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#51607c]">
          <button type="button" onClick={addExtraSet} className="rounded-full border border-[rgba(10,46,92,0.24)] px-3 py-1 text-xs font-medium text-[#4b5a72]">
            Anadir serie
          </button>
          <button type="button" onClick={removeLastSet} className="rounded-full border border-[rgba(10,46,92,0.24)] px-3 py-1 text-xs font-medium text-[#4b5a72]">
            Quitar ultima
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MediaField
            label="Imagen de referencia"
            value={session.mediaImage}
            placeholder="https://images.unsplash.com/..."
            onChange={(value) => setSession((prev) => ({ ...prev, mediaImage: value }))}
          />
          <MediaField
            label="Video de referencia"
            value={session.mediaVideo}
            placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
            onChange={(value) => setSession((prev) => ({ ...prev, mediaVideo: value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[#51607c]">Notas</label>
          <textarea
            className="w-full rounded border px-3 py-2 text-sm"
            rows={3}
            value={session.notes}
            onChange={(event) => setSession((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Puntos tecnicos, ajustes o molestias"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
            disabled={!userId || isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar registro"}
          </button>
        </div>
      </form>
    </section>
  );
}
