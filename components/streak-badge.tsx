interface Props {
  streak: number
  best: number
}

export function StreakBadge({ streak, best }: Props){
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-sm">Racha actual</p>
      <p className="text-2xl font-bold">{streak} días</p>
      <p className="text-xs text-muted-foreground">Mejor racha: {best}</p>
    </div>
  )
}
