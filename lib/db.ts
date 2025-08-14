import Dexie, { Table } from "dexie"
import type { Exercise } from "@/lib/models/exercise"
import type { Routine } from "@/lib/models/routine"
import type { Session } from "@/lib/models/session"
import type { PR } from "@/lib/models/pr"
import type { CardioLog } from "@/lib/models/cardio"

export class AppDB extends Dexie {
  exercises!: Table<Exercise, string>
  routines!: Table<Routine, string>
  sessions!: Table<Session, string>
  prs!: Table<PR, string>
  cardioLogs!: Table<CardioLog, string>

  constructor() {
    super("fittracker")
    this.version(1).stores({
      exercises: "id,name,musclesPrimary",
      routines: "id,name,goal",
      sessions: "id,dateISO,routineId",
      prs: "id,exerciseId,dateISO",
      cardioLogs: "id,dateISO,type",
    })
  }
}

export const db = new AppDB()
