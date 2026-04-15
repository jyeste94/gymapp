import clsx from "clsx";

type ActivityData = {
    day: string;
    value: number; // 0-1 range for height/opacity relative to max
    isToday: boolean;
};

type Props = {
    data: ActivityData[];
};

export default function ActivityChart({ data }: Props) {
    return (
        <div className="flex h-32 items-end justify-between gap-2 px-2">
            {data.map((item, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="relative h-full w-full max-w-[12px] flex-1 rounded-full bg-brand-border/30">
                        <div
                            className={clsx(
                                "absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500",
                                item.isToday ? "bg-brand-primary shadow-[0_0_12px_rgba(74,222,128,0.4)]" : "bg-brand-primary/60"
                            )}
                            style={{ height: `${Math.max(item.value * 100, 6)}%` }} // Min height 6%
                        />
                    </div>
                    <span className={clsx(
                        "text-[10px] font-medium uppercase",
                        item.isToday ? "text-brand-primary" : "text-brand-text-muted"
                    )}>
                        {item.day}
                    </span>
                </div>
            ))}
        </div>
    );
}
