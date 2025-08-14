import { create } from "zustand"
import type { Session } from "@/lib/models/session"

interface SessionState {
  sessions: Session[]
  current?: Session
  addSession: (s: Session) => void
  setCurrent: (id: string) => void
  updateSession: (s: Session) => void
}

export const useSessionsStore = create<SessionState>((set) => ({
  sessions: [],
  current: undefined,
  addSession: (s) => set((state) => ({ sessions: [...state.sessions, s] })),
  setCurrent: (id) => set((state) => ({ current: state.sessions.find((s) => s.id === id) })),
  updateSession: (s) =>
    set((state) => ({
      sessions: state.sessions.map((sess) => (sess.id === s.id ? s : sess)),
      current: state.current?.id === s.id ? s : state.current,
    })),
}))
