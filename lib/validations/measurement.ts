import { z } from "zod";

// Helper to handle commas and empty values
// Returns undefined for invalid numbers to treat them as "missing" (or valid if optional)
export const processNumber = (val: unknown) => {
    if (val === "" || val === undefined || val === null) return undefined;

    if (typeof val === "number") {
        return Number.isFinite(val) ? val : undefined;
    }

    const str = String(val).replace(",", ".");
    const num = Number(str);
    return Number.isFinite(num) ? num : undefined;
};

const bodyFatSchema = z.preprocess(
    processNumber,
    z.number({ invalid_type_error: "Debe ser un número" })
        .min(3, "Mínimo 3%")
        .max(70, "Máximo 70%")
        .optional()
);

const measurementSchema = z.preprocess(
    processNumber,
    z.number({ invalid_type_error: "Debe ser un número" })
        .min(5, "Mínimo 5 cm")
        .max(300, "Máximo 300 cm")
        .optional()
);

export const measurementFormSchema = z.object({
    date: z.string().min(1, "La fecha es obligatoria"),
    weightKg: z.preprocess(
        processNumber,
        z.number({ required_error: "El peso es obligatorio", invalid_type_error: "Introduce un número válido" })
            .min(30, "Mínimo 30 kg")
            .max(300, "Máximo 300 kg")
    ),
    bodyFatPct: bodyFatSchema,
    chest: measurementSchema,
    waist: measurementSchema,
    hips: measurementSchema,
    arm: measurementSchema,
    thigh: measurementSchema,
    calf: measurementSchema,
    notes: z.string().max(200, "Máximo 200 caracteres").optional(),
});

export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;
