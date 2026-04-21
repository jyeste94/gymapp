import clsx from "clsx";

type ActivityData = {
  day: string;
  value: number;
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
          <div className="relative h-full w-full max-w-[12px] flex-1 rounded-full bg-apple-near-black/10 dark:bg-white/10">
            <div
              className={clsx(
                "absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500",
                item.isToday ? "bg-apple-blue shadow-[0_0_12px_rgba(0,113,227,0.35)]" : "bg-apple-blue/55",
              )}
              style={{ height: `${Math.max(item.value * 100, 6)}%` }}
            />
          </div>
          <span className={clsx("sf-text-nano uppercase", item.isToday ? "text-apple-blue" : "text-apple-near-black/55 dark:text-white/55")}>
            {item.day}
          </span>
        </div>
      ))}
    </div>
  );
}
