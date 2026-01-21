import { useCol } from "@/lib/firestore/hooks";
import { add } from "@/lib/firestore/crud";
import { Firestore } from "firebase/firestore";
import type { RoutineLog } from "@/lib/types";

export const useWorkoutLogs = (userId?: string | null) =>
    useCol<RoutineLog>(userId ? `users/${userId}/workoutLogs` : null, { by: "date", dir: "desc" });

export const addWorkoutLog = async (db: Firestore, userId: string, log: Omit<RoutineLog, "id">) => {
    return add(db, `users/${userId}/workoutLogs`, {
        ...log,
        id: crypto.randomUUID(),
    });
};
