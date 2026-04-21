import type { Routine } from "@/lib/types";
import type { RoutineExercise } from "@/lib/types";

type ExerciseHeaderProps = {
    exercise: RoutineExercise;
    routine: Routine;
};

export default function ExerciseHeader({ exercise, routine }: ExerciseHeaderProps) {
    return (
        <header className="rounded-3xl border-none bg-white dark:bg-apple-surface-1 p-6 lg:p-8 shadow-apple-card relative overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                    <p className="sf-text-caption-strong uppercase tracking-widest text-apple-blue/80">
                        {routine.title} - {routine.level}
                    </p>
                </div>
                <h1 className="sf-display-card-title text-apple-near-black dark:text-white mb-4">{exercise.name}</h1>
                <div className="flex flex-wrap gap-2">
                    {exercise.muscleGroup.map((group) => (
                        <div key={group} className="rounded-full bg-apple-gray dark:bg-apple-surface-2 px-3 py-1 sf-text-nano font-medium text-apple-near-black/60 dark:text-white/60 border border-apple-near-black/5 dark:border-white/5 shadow-sm">
                            {group}
                        </div>
                    ))}
                    {exercise.equipment.map((equip) => (
                        <div key={equip} className="rounded-full bg-apple-blue/10 px-3 py-1 sf-text-nano font-medium text-apple-blue border border-apple-blue/10 shadow-sm">
                            {equip}
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}
