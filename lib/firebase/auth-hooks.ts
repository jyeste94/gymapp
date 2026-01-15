
"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { create } from "zustand";
import { useEffect } from "react";
import { useFirebase } from "./client-context";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const useAuthStore = create<AuthState>(() => ({ user: null, loading: true }));

export function useAuth() {
  const { user, loading } = useAuthStore();
  const { auth } = useFirebase();

  useEffect(() => {
    if (!auth) {
      useAuthStore.setState({ loading: true });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      useAuthStore.setState({ user: nextUser, loading: false });
      if (typeof document !== "undefined") {
        if (nextUser) {
          document.cookie = `uid=${nextUser.uid}; path=/; samesite=lax`;
        } else {
          document.cookie = "uid=; Max-Age=0; path=/";
        }
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
