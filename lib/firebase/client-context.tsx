
"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import app, { auth, db } from "./config";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { FirebaseApp } from "firebase/app";
import { Auth } from "firebase/auth";
import { Firestore } from "firebase/firestore";

const storage = typeof window !== "undefined" ? getStorage(app) : null;

interface FirebaseContextProps {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  storage: FirebaseStorage | null;
}

const FirebaseContext = createContext<FirebaseContextProps>({
  app: null,
  auth: null,
  db: null,
  storage: null,
});

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebase] = useState<FirebaseContextProps>({
    app,
    auth,
    db,
    storage,
  });

  return <FirebaseContext.Provider value={firebase}>{children}</FirebaseContext.Provider>;
}

