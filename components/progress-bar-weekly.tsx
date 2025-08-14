interface Props {
  days: boolean[]
}

const dayNames = ["L", "M", "X", "J", "V", "S", "D"]

export function ProgressBarWeekly({ days }: Props) {
  return (
    <div className="flex gap-1 items-end h-12">
      {days.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div
            className={`w-full rounded-t bg-primary ${d ? "h-full" : "h-2 bg-muted"}`}
            aria-hidden="true"
          />
          <span className="text-[10px] mt-1">{dayNames[i]}</span>
        </div>
      ))}
    </div>
  )
}
