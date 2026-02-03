
/**
 * Recursively removes keys with `undefined` values from an object.
 * Firestore throws error on `undefined`, so we need to clean objects before saving.
 */
export function sanitizeForFirestore(obj: unknown): unknown {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);

    return Object.entries(obj as Record<string, unknown>).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = sanitizeForFirestore(value);
        }
        return acc;
    }, {} as Record<string, unknown>);
}
