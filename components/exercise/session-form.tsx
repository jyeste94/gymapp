import clsx from "clsx";
import MediaField from "@/components/ui/media-field";
import type { SessionState } from "./types";

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
    <section className="apple-panel p-4 sm:p-6">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block sf-text-caption-strong text-apple-near-black/70 dark:text-white/70">Fecha y hora</label>
            <input
              type="datetime-local"
              value={session.sessionDate}
              onChange={(event) => setSession((prev) => ({ ...prev, sessionDate: event.target.value }))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="block sf-text-caption-strong text-apple-near-black/70 dark:text-white/70">Esfuerzo percibido (RPE)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={session.perceivedEffort}
              onChange={(event) => setSession((prev) => ({ ...prev, perceivedEffort: event.target.value }))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-3">
          {session.sets.map((set, index) => (
            <div
              key={index}
              className={clsx(
                "rounded-2xl border px-4 py-4 transition-colors",
                set.completed
                  ? "border-[#34C759]/20 bg-[#34C759]/5"
                  : "border-apple-near-black/5 bg-white dark:border-white/5 dark:bg-apple-surface-1",
              )}
            >
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="sf-text-caption-strong text-apple-near-black dark:text-white">Serie {index + 1}</span>
                <button
                  type="button"
                  onClick={() => toggleSetCompleted(index)}
                  className={clsx(
                    "rounded-xl px-3 py-1.5 sf-text-nano font-semibold transition-colors",
                    set.completed
                      ? "bg-[#34C759] text-white"
                      : "border border-apple-near-black/5 bg-apple-gray text-apple-near-black/60 hover:bg-apple-near-black/5 dark:border-white/5 dark:bg-apple-surface-2 dark:text-white/60 dark:hover:bg-white/5",
                  )}
                >
                  {set.completed ? "Completada" : "Pendiente"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5 text-sm sm:gap-3">
                <input
                  type="text"
                  placeholder="Kg / Lbs"
                  value={set.weight}
                  onChange={(event) => handleSetField(index, "weight")(event.target.value)}
                  className="w-full text-center"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={set.reps}
                  onChange={(event) => handleSetField(index, "reps")(event.target.value)}
                  className="w-full text-center"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="RIR"
                  value={set.rir}
                  onChange={(event) => handleSetField(index, "rir")(event.target.value)}
                  className="w-full text-center"
                  min="0"
                  max="5"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:gap-3">
          <button type="button" onClick={addExtraSet} className="btn-apple-ghost w-full sm:w-auto">
            Anadir serie
          </button>
          <button
            type="button"
            onClick={removeLastSet}
            className="w-full rounded-xl border border-apple-near-black/10 bg-white px-4 py-2.5 sf-text-caption font-semibold text-[#FF3B30] transition hover:bg-[#FF3B30]/5 sm:w-auto dark:border-white/15 dark:bg-apple-surface-1"
          >
            Quitar ultima
          </button>
        </div>

        <div className="apple-divider grid gap-4 pt-4 md:grid-cols-2">
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

        <div className="space-y-2 pb-2">
          <label className="block sf-text-caption-strong text-apple-near-black/70 dark:text-white/70">Notas</label>
          <textarea
            rows={3}
            value={session.notes}
            onChange={(event) => setSession((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Puntos tecnicos, ajustes o molestias"
            className="w-full"
          />
        </div>

        <div className="apple-divider flex justify-end pt-4">
          <button type="button" onClick={handleSave} className="btn-apple-primary w-full px-8 py-3 md:w-auto" disabled={!userId || isSaving}>
            {isSaving ? "Guardando..." : "Guardar registro"}
          </button>
        </div>
      </form>
    </section>
  );
}
