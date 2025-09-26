"use client";

import { auth, googleProvider, facebookProvider, twitterProvider, appleProvider } from "./client";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { create } from "zustand";
import { useEffect } from "react";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const useAuthStore = create<AuthState>(() => ({ user: null, loading: true }));

export function useAuth() {
  const { user, loading } = useAuthStore();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
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
  }, []);
  return { user, loading };
}

export const loginEmail = (email: string, pass: string) =>
  signInWithEmailAndPassword(auth, email, pass);

export const signupEmail = (email: string, pass: string) =>
  createUserWithEmailAndPassword(auth, email, pass);

export const loginGoogle = () => signInWithPopup(auth, googleProvider);
export const loginFacebook = () => signInWithPopup(auth, facebookProvider);
export const loginTwitter = () => signInWithPopup(auth, twitterProvider);
export const loginApple = () => signInWithPopup(auth, appleProvider);

export const logout = () => signOut(auth);
