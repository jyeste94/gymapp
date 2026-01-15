
"use client";
import { ReactNode } from "react";
import { FirebaseProvider } from "@/lib/firebase/client-context";

export default function Providers({ children }: { children: ReactNode }) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
