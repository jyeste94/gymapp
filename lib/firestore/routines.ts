
import { add, remove } from "@/lib/firestore/crud";
import type { RoutineTemplateDoc } from "@/lib/data/routine-library";
import { Firestore } from "firebase/firestore";

export type RoutineTemplateInput = Omit<RoutineTemplateDoc, "id">;

export function userRoutineTemplatesPath(uid: string) {
  return `users/${uid}/routineTemplates`;
}

export async function createRoutineTemplate(db: Firestore, uid: string, routine: RoutineTemplateInput) {
  return add(db, userRoutineTemplatesPath(uid), routine);
}

export async function deleteRoutineTemplate(db: Firestore, uid: string, routineId: string) {
  return remove(db, userRoutineTemplatesPath(uid), routineId);
}
