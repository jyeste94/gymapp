import Chip from "@/components/ui/chip";
import type { Routine } from "@/lib/types";
import type { RoutineExercise } from "@/lib/types";

type ExerciseHeaderProps = {
    exercise: RoutineExercise;
    routine: Routine;
};

export default function ExerciseHeader({ exercise, routine }: ExerciseHeaderProps) {
    return (
        <header className="glass-card border-[rgba(10,46,92,0.16)] bg-white/80 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                        {routine.title} - {routine.level}
                    </p>
                </div>
                <h1 className="text-4xl font-bold mb-3 text-zinc-900">{exercise.name}</h1>
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
