const messages = {
  es: {
    dashboard: {
      trainedDays: "Días entrenados",
      todayWorkout: "Entrenamiento de hoy",
    },
  },
} as const

export type Locale = keyof typeof messages

function resolve(path: string[], obj: Record<string, unknown>): unknown {
  return path.reduce<unknown>((acc, key) => {
    if (typeof acc === "object" && acc && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export function t(path: string, locale: Locale = "es"): string {
  const value = resolve(path.split("."), messages[locale] as Record<string, unknown>)
  return typeof value === "string" ? value : path
}
