"use client";

import { auth, googleProvider } from "./client";
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User } from "firebase/auth";
import { create } from "zustand";
import { useEffect } from "react";

type AuthState = { user: User | null; loading: boolean; };
const useAuthStore = create<AuthState>(() => ({ user: null, loading: true }));

export function useAuth() {
  const { user, loading } = useAuthStore();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      useAuthStore.setState({ user: u, loading: false });
      if (typeof document !== "undefined") {
        if (u) document.cookie = `uid=${u.uid}; path=/; samesite=lax`;
        else document.cookie = `uid=; Max-Age=0; path=/`;
      }
    });
    return () => unsub();
  }, []);
  return { user, loading };
}

export const loginEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const loginGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
