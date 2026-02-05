import { describe, it, expect } from "vitest";
import { processNumber, measurementFormSchema } from "./measurement";

describe("Measurement Validation Logic", () => {
    describe("processNumber helper", () => {
        it("should pass through valid numbers", () => {
            expect(processNumber(80)).toBe(80);
            expect(processNumber(70.5)).toBe(70.5);
        });

        it("should parse strings with dots", () => {
            expect(processNumber("80")).toBe(80);
            expect(processNumber("70.5")).toBe(70.5);
        });

        it("should parse strings with commas", () => {
            expect(processNumber("70,5")).toBe(70.5);
            expect(processNumber("100,0")).toBe(100);
        });

        it("should return undefined for empty/null/undefined", () => {
            expect(processNumber("")).toBeUndefined();
            expect(processNumber(null)).toBeUndefined();
            expect(processNumber(undefined)).toBeUndefined();
        });

        it("should return original value for invalid strings (to trigger invalid_type_error)", () => {
            expect(processNumber("abc")).toBe("abc");
            expect(processNumber("80kg")).toBe("80kg");
        });

        it("should return undefined for explicit NaN", () => {
            expect(processNumber(NaN)).toBeUndefined();
        });
    });

    describe("measurementFormSchema", () => {
        // Helper to validate just the relevant part or full object
        const validBase = {
            date: "2023-01-01",
            weightKg: 80,
        };

        it("should validate a correct full object", () => {
            const result = measurementFormSchema.safeParse(validBase);
            expect(result.success).toBe(true);
        });

        it("should handle comma inputs for weight", () => {
            const result = measurementFormSchema.safeParse({
                ...validBase,
                weightKg: "80,5"
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.weightKg).toBe(80.5);
            }
        });

        it("should fail if weight is missing or invalid", () => {
            const result = measurementFormSchema.safeParse({
                ...validBase,
                weightKg: ""
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                // checks for the required_error custom message
                expect(result.error.issues[0].message).toMatch(/obligatorio|válido/);
            }
        });

        it("should fail if weight is non-numeric text", () => {
            const result = measurementFormSchema.safeParse({
                ...validBase,
                weightKg: "noventa"
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                // Should trigger invalid_type_error
                expect(result.error.issues[0].message).toBe("Introduce un número válido");
            }
        });

        it("should fail if weight is NaN (simulated)", () => {
            const result = measurementFormSchema.safeParse({
                ...validBase,
                weightKg: NaN
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toBe("El peso es obligatorio");
            }
        });

        it("should allow optional fields to be empty", () => {
            const result = measurementFormSchema.safeParse({
                ...validBase,
                bodyFatPct: "",
                chest: undefined
            });
            expect(result.success).toBe(true);
        });

        it("should validate bodyFat range", () => {
            const result = measurementFormSchema.safeParse({
                ...validBase,
                bodyFatPct: 2
            });
            expect(result.success).toBe(false); // min 3
        });
    });
});
