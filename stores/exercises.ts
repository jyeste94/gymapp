import { create } from "zustand"
import type { Exercise } from "@/lib/models/exercise"

interface ExercisesState {
  exercises: Exercise[]
  setExercises: (exercises: Exercise[]) => void
  addExercise: (exercise: Exercise) => void
}

export const useExercisesStore = create<ExercisesState>((set) => ({
  exercises: [],
  setExercises: (exercises) => set({ exercises }),
  addExercise: (exercise) => set((state) => ({ exercises: [...state.exercises, exercise] })),
}))
