import { create } from "zustand"

interface UIState {
  restTimer: number
  setRestTimer: (s: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  restTimer: 0,
  setRestTimer: (s) => set({ restTimer: s }),
}))
