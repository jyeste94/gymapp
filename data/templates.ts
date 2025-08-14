import type { WorkoutTemplate } from "./models"

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "full-body-3-dias",
    name: "Full Body 3 Días",
    goal: "fuerza",
    blocks: [
      {
        name: "Calentamiento",
        items: [
          {
            exerciseId: "sentadillas-peso-corporal",
            sets: 2,
            reps: 10,
            weightType: "absoluto",
            restSec: 60,
            notes: "Calentamiento dinámico",
          },
          {
            exerciseId: "flexiones",
            sets: 2,
            reps: 8,
            weightType: "absoluto",
            restSec: 60,
          },
        ],
      },
      {
        name: "Bloque Principal",
        items: [
          {
            exerciseId: "sentadilla-trasera",
            sets: 3,
            repRange: [5, 8],
            weightType: "%",
            intensity: 80,
            restSec: 180,
            notes: "Ejercicio principal del día",
          },
          {
            exerciseId: "press-banca",
            sets: 3,
            repRange: [5, 8],
            weightType: "%",
            intensity: 80,
            restSec: 180,
          },
          {
            exerciseId: "peso-muerto-convencional",
            sets: 3,
            repRange: [5, 8],
            weightType: "%",
            intensity: 75,
            restSec: 180,
          },
        ],
      },
      {
        name: "Trabajo Accesorio",
        items: [
          {
            name: "Superset Brazos",
            items: [
              {
                exerciseId: "curl-biceps-mancuernas",
                sets: 3,
                repRange: [8, 12],
                weightType: "absoluto",
                restSec: 0,
              },
              {
                exerciseId: "extension-triceps-mancuernas",
                sets: 3,
                repRange: [8, 12],
                weightType: "absoluto",
                restSec: 90,
              },
            ],
          },
          {
            exerciseId: "plancha",
            sets: 3,
            reps: 30,
            weightType: "absoluto",
            restSec: 60,
            notes: "Mantener 30 segundos",
          },
        ],
      },
    ],
  },
  {
    id: "push-pull-legs",
    name: "Push/Pull/Legs 6 Días",
    goal: "hipertrofia",
    blocks: [
      {
        name: "Push - Pecho y Hombros",
        items: [
          {
            exerciseId: "press-banca",
            sets: 4,
            repRange: [6, 8],
            weightType: "%",
            intensity: 85,
            restSec: 180,
          },
          {
            exerciseId: "press-inclinado-mancuernas",
            sets: 3,
            repRange: [8, 12],
            weightType: "absoluto",
            restSec: 120,
          },
          {
            exerciseId: "press-militar",
            sets: 3,
            repRange: [8, 10],
            weightType: "absoluto",
            restSec: 120,
          },
          {
            name: "Superset Hombros",
            items: [
              {
                exerciseId: "elevaciones-laterales",
                sets: 3,
                repRange: [12, 15],
                weightType: "absoluto",
                restSec: 0,
              },
              {
                exerciseId: "face-pull",
                sets: 3,
                repRange: [15, 20],
                weightType: "absoluto",
                restSec: 90,
              },
            ],
          },
          {
            exerciseId: "extension-triceps-polea",
            sets: 3,
            repRange: [10, 15],
            weightType: "absoluto",
            restSec: 90,
          },
        ],
      },
    ],
  },
  {
    id: "torso-pierna-4-dias",
    name: "Torso/Pierna 4 Días",
    goal: "mixto",
    blocks: [
      {
        name: "Torso - Día A",
        items: [
          {
            exerciseId: "press-banca",
            sets: 4,
            repRange: [4, 6],
            weightType: "%",
            intensity: 87,
            restSec: 180,
          },
          {
            exerciseId: "remo-pendlay",
            sets: 4,
            repRange: [4, 6],
            weightType: "%",
            intensity: 85,
            restSec: 180,
          },
          {
            exerciseId: "press-militar",
            sets: 3,
            repRange: [6, 8],
            weightType: "absoluto",
            restSec: 120,
          },
          {
            name: "Superset Espalda",
            items: [
              {
                exerciseId: "jalon-pecho",
                sets: 3,
                repRange: [8, 12],
                weightType: "absoluto",
                restSec: 0,
              },
              {
                exerciseId: "remo-sentado-polea",
                sets: 3,
                repRange: [8, 12],
                weightType: "absoluto",
                restSec: 90,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "5x5-fuerza",
    name: "5x5 Fuerza",
    goal: "fuerza",
    blocks: [
      {
        name: "Día A",
        items: [
          {
            exerciseId: "sentadilla-trasera",
            sets: 5,
            reps: 5,
            weightType: "%",
            intensity: 85,
            restSec: 300,
            notes: "Progresión lineal semanal",
          },
          {
            exerciseId: "press-banca",
            sets: 5,
            reps: 5,
            weightType: "%",
            intensity: 85,
            restSec: 300,
          },
          {
            exerciseId: "remo-pendlay",
            sets: 5,
            reps: 5,
            weightType: "%",
            intensity: 85,
            restSec: 300,
          },
        ],
      },
      {
        name: "Día B",
        items: [
          {
            exerciseId: "sentadilla-trasera",
            sets: 5,
            reps: 5,
            weightType: "%",
            intensity: 85,
            restSec: 300,
          },
          {
            exerciseId: "press-militar",
            sets: 5,
            reps: 5,
            weightType: "%",
            intensity: 85,
            restSec: 300,
          },
          {
            exerciseId: "peso-muerto-convencional",
            sets: 1,
            reps: 5,
            weightType: "%",
            intensity: 90,
            restSec: 300,
            notes: "Solo 1 serie pesada",
          },
        ],
      },
    ],
  },
  {
    id: "hipertrofia-casa",
    name: "Hipertrofia en Casa",
    goal: "hipertrofia",
    blocks: [
      {
        name: "Tren Superior",
        items: [
          {
            exerciseId: "flexiones",
            sets: 4,
            repRange: [8, 15],
            weightType: "absoluto",
            restSec: 90,
            notes: "Varía el ángulo si es necesario",
          },
          {
            exerciseId: "fondos-banco",
            sets: 3,
            repRange: [8, 12],
            weightType: "absoluto",
            restSec: 90,
          },
          {
            exerciseId: "remo-invertido",
            sets: 4,
            repRange: [6, 12],
            weightType: "absoluto",
            restSec: 90,
          },
          {
            name: "Circuito Core",
            items: [
              {
                exerciseId: "plancha",
                sets: 3,
                reps: 45,
                weightType: "absoluto",
                restSec: 0,
                notes: "45 segundos",
              },
              {
                exerciseId: "mountain-climbers",
                sets: 3,
                reps: 20,
                weightType: "absoluto",
                restSec: 0,
              },
              {
                exerciseId: "hollow-hold",
                sets: 3,
                reps: 30,
                weightType: "absoluto",
                restSec: 120,
                notes: "30 segundos",
              },
            ],
          },
        ],
      },
      {
        name: "Tren Inferior",
        items: [
          {
            exerciseId: "sentadillas-peso-corporal",
            sets: 4,
            repRange: [15, 25],
            weightType: "absoluto",
            restSec: 90,
          },
          {
            exerciseId: "zancadas-peso-corporal",
            sets: 3,
            repRange: [10, 15],
            weightType: "absoluto",
            restSec: 90,
            notes: "Por pierna",
          },
          {
            exerciseId: "puente-gluteo",
            sets: 4,
            repRange: [15, 20],
            weightType: "absoluto",
            restSec: 60,
          },
          {
            exerciseId: "step-ups",
            sets: 3,
            repRange: [10, 12],
            weightType: "absoluto",
            restSec: 90,
            notes: "Por pierna, usa escalón o banco",
          },
        ],
      },
    ],
  },
  {
    id: "fuerza-casa",
    name: "Fuerza en Casa",
    goal: "fuerza",
    blocks: [
      {
        name: "Día 1 - Empuje",
        items: [
          {
            exerciseId: "flexiones",
            sets: 5,
            repRange: [3, 8],
            weightType: "absoluto",
            restSec: 180,
            notes: "Progresa hacia flexiones a una mano",
          },
          {
            exerciseId: "fondos-banco",
            sets: 4,
            repRange: [5, 10],
            weightType: "absoluto",
            restSec: 120,
          },
          {
            exerciseId: "plancha",
            sets: 3,
            reps: 60,
            weightType: "absoluto",
            restSec: 90,
            notes: "60 segundos",
          },
        ],
      },
      {
        name: "Día 2 - Tirón",
        items: [
          {
            exerciseId: "dominadas",
            sets: 5,
            repRange: [1, 5],
            weightType: "absoluto",
            restSec: 180,
            notes: "Usa banda si es necesario",
          },
          {
            exerciseId: "remo-invertido",
            sets: 4,
            repRange: [5, 10],
            weightType: "absoluto",
            restSec: 120,
          },
          {
            exerciseId: "pull-aparts-banda",
            sets: 3,
            repRange: [15, 20],
            weightType: "absoluto",
            restSec: 60,
          },
        ],
      },
      {
        name: "Día 3 - Piernas",
        items: [
          {
            exerciseId: "sentadillas-peso-corporal",
            sets: 5,
            repRange: [8, 15],
            weightType: "absoluto",
            restSec: 120,
            notes: "Progresa hacia pistol squats",
          },
          {
            exerciseId: "zancadas-peso-corporal",
            sets: 4,
            repRange: [6, 10],
            weightType: "absoluto",
            restSec: 90,
            notes: "Por pierna",
          },
          {
            exerciseId: "puente-gluteo",
            sets: 4,
            repRange: [10, 15],
            weightType: "absoluto",
            restSec: 90,
            notes: "Progresa hacia una pierna",
          },
        ],
      },
    ],
  },
]

// Helper functions
export function getTemplatesByGoal(goal: string): WorkoutTemplate[] {
  return workoutTemplates.filter((template) => template.goal === goal)
}

export function getTemplateById(id: string): WorkoutTemplate | undefined {
  return workoutTemplates.find((template) => template.id === id)
}

export function searchTemplates(query: string): WorkoutTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return workoutTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      (template.goal && template.goal.toLowerCase().includes(lowercaseQuery)),
  )
}
