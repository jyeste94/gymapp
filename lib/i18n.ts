export const t = (key: string) => dict[key] ?? key;

const dict: Record<string, string> = {
  "dashboard.title": "Panel",
  "add.measurement": "Añadir medición",
  "start.workout": "Iniciar entreno",
  "edit.diet": "Editar dieta",
  "kcal.today": "Kcal del día",
  "last.measurement": "Última medición",
  "upcoming.workouts": "Próximos entrenos",
};
