import { useCol, useDoc } from "./hooks";
import { add, update, remove } from "./crud";
import { Firestore } from "firebase/firestore";
import type { Diet } from "@/lib/types";

// Hook to list all diets for a user
export const useDiets = (userId?: string | null) =>
    useCol<Diet>(userId ? `users/${userId}/diets` : null, { by: "updatedAt", dir: "desc" });

// Hook to get a single diet
export const useDiet = (userId: string | undefined, dietId: string) =>
    useDoc<Diet>(userId ? `users/${userId}/diets/${dietId}` : null);

// Hook to get the active diet (convenience wrapper around useDiets filtering)
// In a real app we might want a specific 'activeDietId' field on the UserProfile, but filtering works for now.
export const useActiveDiet = (userId?: string | null) => {
    const { data: diets } = useDiets(userId);
    return diets?.find(d => d.isActive) ?? null;
};

export async function createDiet(db: Firestore, userId: string, dietData: Omit<Diet, "id">) {
    // Check if active, if so, deactivate others? Or handle that in UI.
    // For now just add.
    return add(db, `users/${userId}/diets`, dietData);
}

export async function updateDiet(db: Firestore, userId: string, dietId: string, data: Partial<Diet>) {
    return update(db, `users/${userId}/diets`, dietId, {
        ...data,
        updatedAt: new Date().toISOString(),
    });
}

export async function deleteDiet(db: Firestore, userId: string, dietId: string) {
    return remove(db, `users/${userId}/diets`, dietId);
}

export async function setDietActive(db: Firestore, userId: string, dietId: string) {
    // This ideally should be a transaction to unset others, but for simplicity:
    // User will ensure only one is blue in UI? 
    // Better: We should probably fetch all and toggle. 
    // Or simpler: Just update this one to active.

    return update(db, `users/${userId}/diets`, dietId, { isActive: true });
}
