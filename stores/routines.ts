import { create } from "zustand"
import type { Routine } from "@/lib/models/routine"

interface RoutineState {
  routines: Routine[]
  addRoutine: (routine: Routine) => void
  updateRoutine: (routine: Routine) => void
  removeRoutine: (id: string) => void
}

export const useRoutinesStore = create<RoutineState>((set) => ({
  routines: [],
  addRoutine: (routine) => set((state) => ({ routines: [...state.routines, routine] })),
  updateRoutine: (routine) =>
    set((state) => ({ routines: state.routines.map((r) => (r.id === routine.id ? routine : r)) })),
  removeRoutine: (id) => set((state) => ({ routines: state.routines.filter((r) => r.id !== id) })),
}))
