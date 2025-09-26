import { add } from "@/lib/firestore/crud";
import type { RoutineTemplateDoc } from "@/lib/data/routine-library";

export type RoutineTemplateInput = Omit<RoutineTemplateDoc, "id">;

export function userRoutineTemplatesPath(uid: string) {
  return `users/${uid}/routineTemplates`;
}

export async function createRoutineTemplate(uid: string, routine: RoutineTemplateInput) {
  return add(userRoutineTemplatesPath(uid), routine);
}
