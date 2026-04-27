# ATHLOS FIT - Contexto Completo del Proyecto

## 1. Visión General

**Athlos Fit** es una aplicación de tracking fitness (PWA + mobile via Capacitor).
Idioma: Español. Stack completo en la sección 3.

### Arquitectura de datos (CRITICAL)
- **Firebase** → SOLO autenticación (login Google/Email)
- **NutriFlow API** (Symfony 6.4 + MySQL) → TODOS los datos de la aplicación
- NO se usa Firestore para almacenamiento de datos (solo auth)

## 2. Repositorios

- App frontend: `C:\wamp64\www\documents\gym`
- API backend: `C:\wamp64\www\documents\NutriFlow`

## 3. Stack Tecnológico

### Frontend (gym)
| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15.0.7 (App Router, export estático `output: 'export'`) |
| Lenguaje | TypeScript 5.6+ strict |
| Estilos | Tailwind CSS 3.4 + Apple design system |
| Animación | Framer Motion 12.x |
| Estado | Zustand 4.5 (persist middleware para localStorage) |
| Backend API | NutriFlow REST client (Firebase ID token auth) |
| Gráficas | Recharts 2.12 |
| Formularios | React Hook Form 7.52 + Zod 3.23 |
| Testing | Vitest 4.0 + React Testing Library + happy-dom |
| Mobile | Capacitor 7/8 (Android + iOS) |

### Backend (NutriFlow)
| Capa | Tecnología |
|------|-----------|
| Framework | Symfony 6.4 (PHP 8.1+) |
| ORM | Doctrine 3.6 con Migrations |
| BD | MySQL 8.0 (prod) / SQLite (tests) |
| Auth | Firebase Auth (kreait/firebase-php ^5.26) |
| UUID | Symfony UID v7 |
| CORS | NelmioCorsBundle |
| Tests | PHPUnit 10.5 |
| API Docs | Atributos PHP 8 (no hay OpenAPI) |

## 4. Estructura del Frontend (gym)

```
app/
├── (app)/              # Rutas autenticadas (protegidas por auth-guard)
│   ├── _components/    # Sidebar nav, mobile nav
│   ├── diet/           # Planes de dieta (list + editor)
│   ├── exercises/      # Catálogo de ejercicios (list + detail)
│   ├── measurements/   # Mediciones corporales
│   ├── progress/       # Gráficas (volumen, fuerza, heatmap muscular)
│   ├── routines/       # Rutinas (list, detail, day, create drawer)
│   ├── settings/       # Ajustes + perfil
│   ├── workout/        # Workout activo + finish
│   ├── layout.tsx      # App shell (sidebar + auth guard)
│   ├── page.tsx        # Dashboard
│   └── template.tsx
├── (auth)/login/       # Login/signup
├── layout.tsx          # Root layout
└── providers.tsx       # Firebase context provider

components/
├── auth/               # Auth guard wrapper
├── dashboard/          # Metric cards, activity chart
├── diet/               # Food search
├── exercise/           # Header, history, progress chart, technique guide, session form
├── progress/           # Muscle heatmap, volume/strength/muscle-volume charts
├── routines/           # Routine history card
├── ui/                 # Primitives: chip, media-field, media-showcase, motion
└── workout/            # Workout timer

lib/
├── api/nutriflow.ts              # REST client completo para NutriFlow API
├── firebase/                     # Firebase init, auth hooks, auth actions
├── firestore/                    # Capa de acceso a datos (TODA via NutriFlow API)
│   ├── hooks.ts                  # useCol/useDoc (intercepta routineTemplates → API)
│   ├── exercise-logs.ts          # useExerciseLogs + save/update (via API)
│   ├── workout-logs.ts           # useWorkoutLogs + addWorkoutLog (via API)
│   ├── measurements.ts           # useMeasurements + CRUD (via API)
│   ├── routines.ts               # createRoutineTemplate/deleteRoutineTemplate (via API)
│   ├── diets.ts                  # Diet CRUD (via NutriFlow API)
│   ├── crud.ts                   # Generic helpers (no usados activamente)
│   └── utils.ts                  # Firestore utilities
├── data/                         # Datos estáticos (casi todos eliminados)
│   └── exercise-catalog.ts       # buildExerciseCatalog (usa API o datos de rutinas)
├── stores/workout-session.ts     # Zustand store para workout activo (persist)
├── validations/                  # Esquemas Zod (measurements)
├── routine-builder.ts            # Construye Routine desde RoutineTemplate
├── routine-helpers.ts            # mergeRoutines (eliminado), buildExerciseIndex, etc.
├── stats-helpers.ts              # calculateStats, calculateWeeklyVolume, calculateMuscleDistribution
├── workout-helpers.ts            # getExercisesToSave
├── fitness-utils.ts              # Epley 1RM calculator, volume calc
├── types.ts                      # TODOS los tipos TypeScript
└── utils.ts                      # Utilidades generales
```

## 5. API NutriFlow - Todos los Endpoints

### Ejercicios
| Método | Ruta | Descripción | Query Params |
|--------|------|-------------|-------------|
| GET | `/v1/exercises` | Lista ejercicios (paginado) | `page`, `limit`, `muscleGroup`, `equipment` |
| GET | `/v1/exercises/{id}` | Detalle ejercicio | - |

### Alimentos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/v1/foods/search` | Buscar alimentos | `q` (requerido), `page` |
| GET | `/v1/foods/{id}` | Detalle alimento + servings |

### Diario de Comidas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/v1/diaries/{date}` | Obtener diary de una fecha |
| POST | `/v1/diaries/{date}/entries` | Añadir entry | `serving_id`, `mealType`, `multiplier` |
| DELETE | `/v1/diaries/entries/{id}` | Eliminar entry |

### Rutinas
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/v1/routines` | Listar rutinas del usuario (paginado) |
| GET | `/v1/routines/{id}` | Detalle rutina con ejercicios completos |
| POST | `/v1/routines` | Crear rutina |
| DELETE | `/v1/routines/{id}` | Eliminar rutina |

### Workouts (Sesiones de Entrenamiento)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/v1/workouts` | Listar sesiones (`?include_sets=1`) |
| GET | `/v1/workouts/{id}` | Detalle sesión con todos los sets |
| POST | `/v1/workouts` | Iniciar sesión |
| PATCH | `/v1/workouts/{id}` | Actualizar sesión (`duration_minutes`) |
| DELETE | `/v1/workouts/{id}` | Eliminar sesión |
| POST | `/v1/workouts/{id}/sets` | Loggear un set |

### Mediciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/v1/measurements` | Listar mediciones (paginado) |
| POST | `/v1/measurements` | Crear medición |
| PUT | `/v1/measurements/{id}` | Actualizar medición |
| DELETE | `/v1/measurements/{id}` | Eliminar medición |

## 6. Base de Datos (MySQL)

### `users`
| Columna | Tipo |
|---------|------|
| id | CHAR(36) UUID PK |
| firebase_uid | VARCHAR(128) UNIQUE NOT NULL |
| email | VARCHAR(255) NULLABLE |
| roles | JSON NOT NULL |
| created_at | DATETIME NOT NULL |

### `exercises`
| Columna | Tipo |
|---------|------|
| id | CHAR(36) UUID PK |
| name | VARCHAR(255) NOT NULL INDEXED |
| muscle_group | VARCHAR(100) NOT NULL |
| equipment | VARCHAR(100) NULLABLE |
| description | TEXT NULLABLE |
| gif_url | VARCHAR(500) NULLABLE |
| video_url | VARCHAR(500) NULLABLE |

### `routines`
| Columna | Tipo |
|---------|------|
| id | CHAR(36) UUID PK |
| user_id | FK → users.id CASCADE |
| name | VARCHAR(255) NOT NULL |
| days_of_week | JSON NULLABLE |
| INDEX | (user_id, name) |

### `routine_exercises`
| Columna | Tipo |
|---------|------|
| id | CHAR(36) UUID PK |
| routine_id | FK → routines.id CASCADE |
| exercise_id | FK → exercises.id |
| sets | INT NOT NULL |
| reps | INT NOT NULL |
| rest_seconds | INT NOT NULL |
| order_index | INT NOT NULL |

### `workout_sessions`
| Columna | Tipo |
|---------|------|
| id | CHAR(36) UUID PK |
| user_id | FK → users.id CASCADE |
| routine_id | FK → routines.id SET NULL |
| date | DATETIME NOT NULL |
| duration_minutes | INT NULLABLE |

### `workout_set_logs`
| Columna | Tipo |
|---------|------|
| id | CHAR(36) UUID PK |
| session_id | FK → workout_sessions.id CASCADE |
| exercise_id | FK → exercises.id |
| weight | DOUBLE NOT NULL |
| reps | INT NOT NULL |
| completed | TINYINT(1) NOT NULL |

### `foods` / `servings`
- foods: id, external_id (UNIQUE), name, brand, best_serving_id, last_fetched_at, created_at, updated_at
- servings: id, food_id (FK CASCADE), description, amount, unit, calories, proteins, carbs, fats

### `meal_diaries` / `meal_entries`
- meal_diaries: id, user_id (FK CASCADE), date (UNIQUE user+date), total_calories, total_proteins, total_carbs, total_fats
- meal_entries: id, diary_id (FK CASCADE), serving_id (FK), meal_type, multiplier, created_at

### `measurements`
| Columna | Tipo |
|---------|------|
| id | CHAR(36) UUID PK |
| user_id | FK → users.id CASCADE |
| date | DATETIME NOT NULL |
| weight_kg | DOUBLE NOT NULL |
| body_fat_pct | DOUBLE NULLABLE |
| chest_cm / waist_cm / hips_cm / arm_cm / thigh_cm / calf_cm | DOUBLE NULLABLE |
| notes | TEXT NULLABLE |

### `error_logs`
message, stack_trace, context (JSON), created_at

## 7. Flujo de Datos Clave

### Workout completo (sesión completa)
1. User ve día de rutina → clic "Empezar" → `startWorkout()` en store (Zustand)
2. User hace ejercicios → marca sets completados → estado local en store
3. User clic "Terminar" → `/workout/finish`
4. User clic "Guardar" → `addWorkoutLog()`:
   - Crea sesión NutriFlow: `POST /v1/workouts`
   - Loggea cada set: `POST /v1/workouts/{id}/sets`
   - Retorna session ID (no Firestore)

### Ejercicio individual (log rápido)
1. User abre ejercicio → `exercises/detail/page.tsx`
2. User rellena formulario → clic "Guardar" → `saveExerciseLog()`:
   - Crea sesión NutriFlow: `POST /v1/workouts`
   - Loggea sets del ejercicio
   - Retorna session ID
3. `updateExerciseLog()` crea una NUEVA sesión (API no tiene PUT)

### Lectura de histórico
- `useWorkoutLogs()` → `GET /v1/workouts?include_sets=1` → mapea a `RoutineLog[]`
- `useExerciseLogs()` → `GET /v1/workouts?include_sets=1` → extrae sets por ejercicio

### Routine Templates Flow
1. `useCol("users/{uid}/routineTemplates")` → interceptado en `hooks.ts`
2. Llama a `NutriFlowClient.listRoutineTemplates()` → `GET /v1/routines` + `GET /v1/exercises`
3. Mapea `NutriFlowApiRoutine[]` → `RoutineTemplate[]` via `mapApiRoutineToTemplate()`
4. Cada ejercicio en la rutina lleva embebidos: `name`, `description`, `muscleGroup`, `equipment`, `technique`, `image`, `video`
5. `buildRoutine(template)` hidrata usando estos datos embebidos (ya NO necesita `defaultExercises`)

## 8. Cambios Realizados en Esta Sesión

### API (NutriFlow)
- Añadidos endpoints GET/PATCH/DELETE para `/v1/workouts`
- Añadido `?include_sets=1` a GET /v1/workouts
- Añadido GET /v1/exercises/{id} y filtros muscleGroup/equipment
- Añadido GET /v1/routines/{id}
- Creada entidad Measurement + migración + CRUD endpoints

### App (gym)
- `NutriFlowClient` → métodos nuevos: listWorkoutSessions, getWorkoutSession, updateWorkoutSession, deleteWorkoutSession, listExercises (con filtros), getExercise, listMeasurements, createMeasurement, updateMeasurement, deleteMeasurement, getRoutine
- `useWorkoutLogs` → ahora fetch desde API (antes stub)
- `useExerciseLogs` → ahora fetch desde API (antes stub)
- `measurements.ts` → migrado de Firestore a NutriFlowClient
- `routine-builder.ts` → ya no requiere `Exercise[]` (usa datos embebidos de API)
- `exercise-catalog.ts` → acepta `allExercises` opcional desde API
- `exercises/page.tsx` → fetch desde API
- `exercises/detail/page.tsx` → fetch desde API para contextlessExercise
- `stats-helpers.ts` → simplificado (sin dependencia de defaultExercises)
- **Eliminados**: `lib/data/exercises.ts` (584 líneas hardcoded), `lib/data/routine-library.ts`, `lib/data/routine-plan.ts`, `lib/data/data-integrity.test.ts`
- Eliminada función `mergeRoutines` de `routine-helpers.ts`

## 9. Issues Conocidos / Pendientes

### Arreglados (sesión actual)
- ✅ Workout timer ahora usa `startTime` del store (persiste entre recargas)
- ✅ `crypto.randomUUID()` con fallback `Date.now()` + Math.random
- ✅ Auth guard muestra spinner en vez de pantalla en blanco
- ✅ `cancelWorkout` ya no guarda (limpia estado sin persistir)
- ✅ Gráficas adaptadas a dark mode via `useChartTheme()` hook
- ✅ Toast de éxito/error en delete de rutina
- ✅ Settings: theme toggle funcional (oscuro/claro)
- ✅ Empty state en ejercicio sin historial
- ✅ aria-labels en botones del timer

### Arquitectura (pendientes)
1. **`saveExerciseLog` / `updateExerciseLog`** crean sesiones NutriFlow individuales (cada log es una sesión separada). No hay forma de actualizar (API no tiene PUT en sets)
2. **No hay paginación real** en useWorkoutLogs (se traen hasta 200 sesiones)
3. **`useExerciseLogs` duplica llamada API** de `useWorkoutLogs` (misma data, mismo fetch)
4. **Routine `daysOfWeek` en API** usa enteros 1-7 o strings encoded JSON, la app espera ids tipo 'lunes', 'tue' (se mapea en `mapApiRoutineToTemplate`)
5. **No hay endpoint PUT** para rutinas (no se pueden editar, solo crear/borrar)
6. **No hay search/filter** en `/v1/exercises` por nombre
7. **`fill: "#8E8E93"` en XAxis ticks** no usa theme (exercise-progress-chart, no se puede pasar objeto a tick.fill directo en Recharts)

## 10. Tipos TypeScript Clave

```typescript
// Ejercicio base (definición)
type Exercise = {
  id: string; name: string; description: string;
  muscleGroup: MuscleGroup[]; equipment: Equipment[];
  technique: string[]; image?: string; video?: string;
}

// Config de ejercicio en plantilla de rutina
type RoutineExerciseConfig = {
  id: string; sets: number; repRange: string; rest: string; tip?: string;
  // En runtime desde API también tiene: name, description, muscleGroup, equipment, technique, image, video
}

// Ejercicio hidratado (Exercise + RoutineExerciseConfig)
type RoutineExercise = Exercise & { sets: number; repRange: string; rest: string; tip?: string; }

// Plantilla de rutina (desde API)
type RoutineTemplate = {
  id: string; title: string; description: string; goal?: string;
  level: RoutineLevel; durationWeeks?: number; frequency: string;
  equipment: Equipment[]; days: RoutineDayTemplate[];
}

// Rutina hidratada (lista para UI)
type Routine = {
  id: string; title: string; description: string; goal?: string;
  level: RoutineLevel; durationWeeks?: number; frequency: string;
  equipment: Equipment[]; days: RoutineDay[];
}

// Log de workout completo
type RoutineLog = {
  id: string; date: string; routineId?: string; routineName?: string;
  dayId?: string; dayName?: string; entries: RoutineLogEntry[];
  effort?: number; duration?: string;
}

type RoutineLogEntry = {
  exerciseId: string; exerciseName: string;
  sets: RoutineLogSet[]; comment?: string; notes?: string;
}

type RoutineLogSet = { reps: number; weight: string; rir?: number; }

// Log de ejercicio individual (desde API, es un extract de workout_sessions)
type ExerciseLog = {
  id: string; exerciseId: string; exerciseName: string;
  routineId?: string; routineName?: string;
  dayId?: string; dayName?: string;
  date: string; perceivedEffort?: string | null; notes?: string | null;
  mediaImage?: string | null; mediaVideo?: string | null;
  sets: ExerciseLogSet[];
}

type ExerciseLogSet = { weight?: string; reps?: string; rir?: string; completed?: boolean; }

// Medición corporal
type Measurement = {
  id: string; date: string; weightKg: number; bodyFatPct?: number | null;
  chest?: number | null; waist?: number | null; hips?: number | null;
  arm?: number | null; thigh?: number | null; calf?: number | null;
  notes?: string | null;
}

// Workout activo (Zustand store, persistido a localStorage)
type WorkoutState = {
  startTime: number | null; routineId: string | null; routineTitle: string | null;
  dayId: string | null; dayTitle: string | null;
  exercises: ActiveExercise[]; activeExerciseId: string | null;
}
```

## 11. Convenciones de Código

- Sin comentarios en el código (salvo excepciones)
- Naming: camelCase en TypeScript, snake_case en API (PHP/MySQL)
- Importaciones: path alias `@/` para `lib/`, `components/`, `app/`
- Estado: Zustand para estado global (workout session), hooks con useState/useEffect para datos API
- API calls: clase estática `NutriFlowClient` con métodos asíncronos
- Firebase context: `useFirebase()` hook para acceso a `{ app, auth, db }`
- Tests: Vitest, archivos co-localizados `*.test.ts` / `*.test.tsx`

## 12. Comandos Útiles

```bash
# App - Frontend
cd C:\wamp64\www\documents\gym
npm run dev              # Desarrollo
npx next build           # Build producción
npx vitest run           # Tests
npx next lint            # Lint

# API - Backend
cd C:\wamp64\www\documents\NutriFlow
php bin/console cache:clear     # Limpiar caché
php bin/console debug:router    # Ver rutas
php bin/console doctrine:migrations:migrate  # Migrar BD
php vendor/bin/phpunit          # Tests
```
