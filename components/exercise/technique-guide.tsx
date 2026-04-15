import type { RoutineExercise } from "@/lib/types";

type TechniqueGuideProps = {
  exercise: RoutineExercise;
};

export default function TechniqueGuide({ exercise }: TechniqueGuideProps) {
  return (
    <section className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-text-main">Técnica recomendada</h2>
      <ul className="mt-4 space-y-2 text-sm text-brand-text-muted">
        {exercise.technique?.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <span className="mt-1.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary/50" aria-hidden />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
