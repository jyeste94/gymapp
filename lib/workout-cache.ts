import { NutriFlowClient, type NutriFlowWorkoutSession } from "@/lib/api/nutriflow";

let cache: NutriFlowWorkoutSession[] | null = null;
let cachePromise: Promise<NutriFlowWorkoutSession[]> | null = null;

export async function getCachedWorkoutSessions(): Promise<NutriFlowWorkoutSession[]> {
  if (cache) return cache;
  if (cachePromise) return cachePromise;

  cachePromise = NutriFlowClient.listWorkoutSessions({ include_sets: true, limit: 200 }).then((sessions) => {
    cache = sessions;
    cachePromise = null;
    return sessions;
  });

  return cachePromise;
}

export function invalidateWorkoutCache(): void {
  cache = null;
}
