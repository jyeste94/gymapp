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
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-brand-text-muted">Fecha y hora</label>
            <input
              type="datetime-local"
              value={session.sessionDate}
              onChange={(event) => setSession((prev) => ({ ...prev, sessionDate: event.target.value }))}
              className="w-full rounded-xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-brand-text-muted">Esfuerzo percibido (RPE)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={session.perceivedEffort}
              onChange={(event) => setSession((prev) => ({ ...prev, perceivedEffort: event.target.value }))}
              className="w-full rounded-xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main"
            />
          </div>
        </div>

        <div className="space-y-3">
          {session.sets.map((set, index) => (
            <div key={index} className="rounded-2xl border border-brand-border bg-brand-dark/50 px-4 py-3">
              <div className="flex items-center justify-between text-xs text-brand-text-muted">
                <span>Serie {index + 1}</span>
                <button
                  type="button"
                  onClick={() => toggleSetCompleted(index)}
                  className={clsx(
                    "rounded-full px-2 py-0.5",
                    set.completed
                      ? "bg-brand-primary/20 text-brand-primary font-medium"
                      : "border border-brand-border bg-brand-dark text-brand-text-muted"
                  )}
                >
                  {set.completed ? "Completada" : "Pendiente"}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <input
                  type="text"
                  placeholder="Kg / Lbs"
                  value={set.weight}
                  onChange={(event) => handleSetField(index, "weight")(event.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-brand-text-main placeholder-brand-text-muted/50"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={set.reps}
                  onChange={(event) => handleSetField(index, "reps")(event.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-brand-text-main placeholder-brand-text-muted/50"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="RIR"
                  value={set.rir}
                  onChange={(event) => handleSetField(index, "rir")(event.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-brand-text-main placeholder-brand-text-muted/50"
                  min="0"
                  max="5"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-brand-text-muted">
          <button type="button" onClick={addExtraSet} className="rounded-full border border-brand-border bg-brand-dark px-3 py-1.5 text-xs font-medium text-brand-text-muted hover:text-brand-text-main transition">
            Añadir serie
          </button>
          <button type="button" onClick={removeLastSet} className="rounded-full border border-brand-border bg-brand-dark px-3 py-1.5 text-xs font-medium text-brand-text-muted hover:text-brand-text-main transition">
            Quitar última
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
          <label className="text-xs text-brand-text-muted">Notas</label>
          <textarea
            className="w-full rounded-xl border border-brand-border bg-brand-dark px-3 py-2 text-sm text-brand-text-main placeholder-brand-text-muted/50"
            rows={3}
            value={session.notes}
            onChange={(event) => setSession((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Puntos técnicos, ajustes o molestias"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-brand-primary px-6 py-2.5 text-sm font-bold text-brand-dark disabled:opacity-50 transition active:scale-95"
            disabled={!userId || isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar registro"}
          </button>
        </div>
      </form>
    </section>
  );
}
