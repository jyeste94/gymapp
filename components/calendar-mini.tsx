interface Props {
  history: Record<string, boolean>
}

export function CalendarMini({ history }: Props) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const first = new Date(year, month, 1)
  const startDay = first.getDay() // 0 dom
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const key = date.toISOString().split("T")[0]
    cells.push({ day: d, done: !!history[key] })
  }

  return (
    <div className="grid grid-cols-7 gap-1 text-center">
      {["D","L","M","X","J","V","S"].map((d) => (
        <div key={d} className="text-xs font-medium">
          {d}
        </div>
      ))}
      {cells.map((c, i) => (
        <div key={i} className="h-8 flex items-center justify-center text-sm">
          {c ? (
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full ${
                c.done ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {c.day}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}
