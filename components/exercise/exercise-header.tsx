import Chip from "@/components/ui/chip";
import type { Routine } from "@/lib/types";
import type { RoutineExercise } from "@/lib/types";

type ExerciseHeaderProps = {
    exercise: RoutineExercise;
    routine: Routine;
};

export default function ExerciseHeader({ exercise, routine }: ExerciseHeaderProps) {
    return (
        <header className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold uppercase tracking-wide text-brand-primary/80">
                        {routine.title} - {routine.level}
                    </p>
                </div>
                <h1 className="text-4xl font-bold mb-3 text-brand-text-main">{exercise.name}</h1>
                <div className="flex flex-wrap gap-2">
                    {exercise.muscleGroup.map((group) => (
                        <Chip key={group} label={group} />
                    ))}
                    {exercise.equipment.map((equip) => (
                        <Chip key={equip} label={equip} />
                    ))}
                </div>
            </div>
        </header>
    );
}
