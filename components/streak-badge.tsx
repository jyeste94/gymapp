interface Props {
  streak: number
}

export function StreakBadge({ streak }: Props) {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
      🔥 <span className="ml-1 font-medium">{streak} días</span>
    </div>
  )
}
