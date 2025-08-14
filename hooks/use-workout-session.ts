"use client"

import type { Session, SessionEntry } from "@/lib/models/session"
import { useSessionsStore } from "@/stores/sessions"

export function useWorkoutSession() {
  const { current, setCurrent, updateSession, addSession } = useSessionsStore()

  function start(session: Session) {
    addSession(session)
    setCurrent(session.id)
  }

  function complete(entry: SessionEntry) {
    if (!current) return
    const entries = current.entries.map((e) =>
      e.exerciseId === entry.exerciseId && e.setIndex === entry.setIndex ? { ...e, ...entry } : e,
    )
    updateSession({ ...current, entries })
  }

  return { session: current, start, complete }
}
