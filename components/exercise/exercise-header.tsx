
import Chip from "@/components/ui/chip";
import type { RoutineDefinition } from "@/lib/data/routine-library";
import type { RoutineExercise } from "@/lib/data/routine-plan";

type ExerciseHeaderProps = {
  exercise: RoutineExercise;
  routine?: RoutineDefinition;
};

export default function ExerciseHeader({ exercise, routine }: ExerciseHeaderProps) {
  return (
    <header className="rounded-2xl border bg-white/70 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {routine ? (
            <p className="text-xs uppercase tracking-wide text-[#51607c]">{routine.title}</p>
          ) : (
            <p className="text-xs uppercase tracking-wide text-[#51607c]">Ficha de Ejercicio</p>
          )}
          <h1 className="text-2xl font-semibold text-zinc-900">{exercise.name}</h1>
          <p className="mt-2 text-sm text-[#4b5a72]">{exercise.description}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2 text-xs text-[#51607c]">
          <Chip label={`${exercise.sets} series`} />
          <Chip label={`${exercise.repRange} reps`} />
          <Chip label={`Descanso ${exercise.rest}`} />
          {[...exercise.muscleGroup, ...exercise.equipment].map((tag) => (
            <Chip key={tag} label={tag} />
          ))}
        </div>
      </div>
    </header>
  );
}
