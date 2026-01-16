import type { RoutineExercise } from "@/lib/types";

type TechniqueGuideProps = {
  exercise: RoutineExercise;
};

export default function TechniqueGuide({ exercise }: TechniqueGuideProps) {
  return (
    <section className="rounded-2xl border bg-white/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Tecnica recomendada</h2>
      <ul className="mt-4 space-y-2 text-sm text-[#4b5a72]">
        {exercise.technique?.map((tip) => (
          <li key={tip} className="flex items-start gap-2">
            <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-zinc-400" aria-hidden />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
