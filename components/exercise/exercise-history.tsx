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
    <section className="apple-panel">
      <h2 className="sf-display-card-title text-apple-near-black dark:text-white">Historial del ejercicio</h2>
      {history.length === 0 ? (
        <p className="mt-4 sf-text-body text-apple-near-black/60 dark:text-white/60">
          Todavia no tienes registros para este ejercicio. Guarda tu primera sesion y aparecera aqui.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {history.map((log) => (
            <li key={log.id} className="rounded-2xl border border-apple-near-black/10 bg-apple-gray p-4 sf-text-caption text-apple-near-black/70 dark:border-white/10 dark:bg-apple-surface-2 dark:text-white/70">
              <div className="flex flex-wrap items-center justify-between gap-2 sf-text-micro text-apple-near-black/50 dark:text-white/50">
                <span>{formatDate(log.date) ?? "Fecha desconocida"}</span>
                {log.perceivedEffort && <span>RPE {log.perceivedEffort}</span>}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {log.sets.map((set, index) => (
                  <div key={index} className="rounded-xl border border-apple-near-black/10 bg-white px-3 py-2 sf-text-caption text-apple-near-black/72 dark:border-white/10 dark:bg-apple-surface-1 dark:text-white/72">
                    Serie {index + 1}: {set.weight ?? "-"} kg - {set.reps ?? "-"} reps
                    {set.rir ? ` - RIR ${set.rir}` : ""}
                    {set.completed ? " - OK" : ""}
                  </div>
                ))}
              </div>

              {log.notes && <p className="mt-2 sf-text-caption">Notas: {log.notes}</p>}

              {(log.mediaImage || log.mediaVideo) && (
                <div className="mt-2 flex flex-wrap gap-3 sf-text-caption">
                  {log.mediaImage && (
                    <a href={log.mediaImage} target="_blank" rel="noreferrer" className="apple-link">
                      Ver imagen
                    </a>
                  )}
                  {log.mediaVideo && (
                    <a href={log.mediaVideo} target="_blank" rel="noreferrer" className="apple-link">
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