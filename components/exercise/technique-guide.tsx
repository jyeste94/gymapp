import type { RoutineExercise } from "@/lib/types";

type TechniqueGuideProps = {
  exercise: RoutineExercise;
};

export default function TechniqueGuide({ exercise }: TechniqueGuideProps) {
  return (
    <section className="rounded-3xl border-none bg-apple-gray dark:bg-apple-surface-2 p-6 shadow-sm">
      <h2 className="sf-text-body-strong text-apple-near-black dark:text-white">Técnica recomendada</h2>
      <ul className="mt-4 space-y-2 sf-text-body text-apple-near-black/70 dark:text-white/70">
        {exercise.technique?.map((tip) => (
          <li key={tip} className="flex items-start gap-3">
            <span className="mt-[7px] inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-apple-blue" aria-hidden />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
