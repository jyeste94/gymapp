import { useCol } from "@/lib/firestore/hooks";
import { add } from "@/lib/firestore/crud";
import { Firestore } from "firebase/firestore";
import type { RoutineLog } from "@/lib/types";

// Los tipos locales han sido eliminados. Ahora importamos desde lib/types.ts

export const useRoutineLogs = (userId?: string | null) =>
  useCol<RoutineLog>(userId ? `users/${userId}/routines` : null, { by: "date", dir: "desc" });

export const addRoutineLog = async (db: Firestore, userId: string, log: Omit<RoutineLog, "id">) => {
  // La funcion "add" es generica. El tipo de "log" viene determinado por la importacion de RoutineLog.
  return add(db, `users/${userId}/routines`, {
    ...log,
    id: crypto.randomUUID(),
  });
};
