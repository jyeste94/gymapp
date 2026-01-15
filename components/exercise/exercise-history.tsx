
import type { ExerciseLog } from "@/lib/firestore/exercise-logs";

const dateFormatter =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" })
    : null;

const formatDate = (iso?: string) => {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    return dateFormatter ? dateFormatter.format(date) : iso;
  } catch {
    return null;
  }
};

type ExerciseHistoryProps = {
  history: ExerciseLog[];
};

export default function ExerciseHistory({ history }: ExerciseHistoryProps) {
  return (
    <section className="rounded-2xl border bg-white/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Historial del ejercicio</h2>
      {history.length === 0 ? (
        <p className="mt-4 text-sm text-[#4b5a72]">
          Todavia no tienes registros para este ejercicio. Guarda tu primera sesion y aparecera aqui.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {history.map((log) => (
            <li key={log.id} className="rounded-xl border px-4 py-3 text-sm text-[#4b5a72]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#51607c]">
                <span>{formatDate(log.date) ?? "Fecha desconocida"}</span>
                {log.perceivedEffort && <span>RPE {log.perceivedEffort}</span>}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {log.sets.map((set, index) => (
                  <div key={index} className="rounded border px-3 py-2 text-xs text-[#51607c]">
                    Serie {index + 1}: {set.weight ?? "-"} kg - {set.reps ?? "-"} reps
                    {set.rir ? ` - RIR ${set.rir}` : ""}
                    {set.completed ? " - OK" : ""}
                  </div>
                ))}
              </div>
              {log.notes && <p className="mt-2 text-xs">Notas: {log.notes}</p>}
              {(log.mediaImage || log.mediaVideo) && (
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#51607c]">
                  {log.mediaImage && (
                    <a href={log.mediaImage} target="_blank" rel="noreferrer" className="underline">
                      Ver imagen
                    </a>
                  )}
                  {log.mediaVideo && (
                    <a href={log.mediaVideo} target="_blank" rel="noreferrer" className="underline">
                      Ver video
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
