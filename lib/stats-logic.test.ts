
import { describe, it, expect } from "vitest";
import { calculateWeeklyVolume, calculateMuscleDistribution } from "./stats-helpers";
import type { RoutineLog } from "@/lib/types";

describe("Stats Helpers Logic", () => {

    describe("calculateWeeklyVolume", () => {
        it("should correctly group sets by week", () => {
            // Mock Logs
            const logs: RoutineLog[] = [
                {
                    id: "1", date: "2023-01-02", // Monday
                    routineId: "r1", routineName: "A",
                    entries: [
                        { exerciseId: "e1", exerciseName: "E1", sets: [{ weight: "10", reps: 10 }, { weight: "10", reps: 10 }] } // 2 sets
                    ]
                },
                {
                    id: "2", date: "2023-01-08", // Sunday (Same week in ISO/App logic?) 
                    // App logic: date.getDay()... 
                    // Let's check implementation behavior: 
                    // "Jan 2 (Mon)" is start of week for Jan 2.
                    // "Jan 8 (Sun)" should fall into Jan 2 week if week starts Monday? 
                    // Logic: diff = date.getDate() - day + (day === 0 ? -6 : 1);
                    // If Jan 8 (Sun, day=0): 8 - 0 + (-6) = 2. So it maps to Jan 2. Correct.
                    routineId: "r1", routineName: "A",
                    entries: [
                        { exerciseId: "e2", exerciseName: "E2", sets: [{ weight: "10", reps: 10 }] } // 1 set
                    ]
                },
                {
                    id: "3", date: "2023-01-09", // Next Monday
                    routineId: "r1", routineName: "A",
                    entries: [
                        { exerciseId: "e3", exerciseName: "E3", sets: [{ weight: "10", reps: 10 }] } // 1 set
                    ]
                }
            ];

            const result = calculateWeeklyVolume(logs);

            // Expected: 
            // Week of Jan 2: 3 sets
            // Week of Jan 9: 1 set

            expect(result).toHaveLength(2);
            expect(result[0].sets).toBe(3);
            expect(result[1].sets).toBe(1);
        });
    });

    describe("calculateMuscleDistribution", () => {
        // Need to rely on defaultExercises or mock the lookup?
        // The function imports defaultExercises directly. So we test against real data mapping.

        it("should map known exercises to muscles", () => {
            const logs: RoutineLog[] = [
                {
                    id: "1", date: "2023-01-01",
                    routineId: "r1", routineName: "Chest Day",
                    entries: [
                        {
                            exerciseId: "press_banca", // Known ID
                            exerciseName: "Press banca plano", // Known Name
                            sets: [{ weight: "10", reps: 10 }, { weight: "10", reps: 10 }, { weight: "10", reps: 10 }] // 3 sets
                        }
                    ]
                }
            ];

            const result = calculateMuscleDistribution(logs);
            // Bench press -> Pecho, Triceps (usually, or just Pecho depends on data)
            // Checking stats-helpers implementation: it iterates muscleGroup array.

            expect(result["Pecho"]).toBeGreaterThanOrEqual(3);
        });

        it("should handle unknown exercises gracefully", () => {
            const logs: RoutineLog[] = [
                {
                    id: "2", date: "2023-01-01",
                    routineId: "r1", routineName: "Unknown",
                    entries: [
                        {
                            exerciseId: "unknown-ex",
                            exerciseName: "Unknown Ex",
                            sets: [{ weight: "0", reps: 0 }]
                        }
                    ]
                }
            ];

            const result = calculateMuscleDistribution(logs);
            expect(Object.keys(result).length).toBe(0);
        });
    });

});
