import { describe, it, expect } from "vitest";
import { calculateWeeklyVolume, calculateMuscleDistribution } from "./stats-helpers";
import type { RoutineLog } from "@/lib/types";

describe("Stats Helpers Logic", () => {

    describe("calculateWeeklyVolume", () => {
        it("should correctly group sets by week", () => {
            const logs: RoutineLog[] = [
                {
                    id: "1", date: "2023-01-02",
                    routineId: "r1", routineName: "A",
                    entries: [
                        { exerciseId: "e1", exerciseName: "E1", sets: [{ weight: "10", reps: 10 }, { weight: "10", reps: 10 }] }
                    ]
                },
                {
                    id: "2", date: "2023-01-08",
                    routineId: "r1", routineName: "A",
                    entries: [
                        { exerciseId: "e2", exerciseName: "E2", sets: [{ weight: "10", reps: 10 }] }
                    ]
                },
                {
                    id: "3", date: "2023-01-09",
                    routineId: "r1", routineName: "A",
                    entries: [
                        { exerciseId: "e3", exerciseName: "E3", sets: [{ weight: "10", reps: 10 }] }
                    ]
                }
            ];

            const result = calculateWeeklyVolume(logs);

            expect(result).toHaveLength(2);
            expect(result[0].sets).toBe(3);
            expect(result[1].sets).toBe(1);
        });
    });

    describe("calculateMuscleDistribution", () => {
        it("should group sets by exercise name", () => {
            const logs: RoutineLog[] = [
                {
                    id: "1", date: "2023-01-01",
                    routineId: "r1", routineName: "Chest Day",
                    entries: [
                        {
                            exerciseId: "press_banca",
                            exerciseName: "Press banca plano",
                            sets: [{ weight: "10", reps: 10 }, { weight: "10", reps: 10 }, { weight: "10", reps: 10 }]
                        }
                    ]
                }
            ];

            const result = calculateMuscleDistribution(logs);
            expect(result["Press banca plano"]).toBe(3);
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
            expect(result["Unknown Ex"]).toBe(1);
        });
    });

});
