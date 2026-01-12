export function calculateOneRM(weight: number, reps: number) {
    if (reps === 1) return weight;
    // Epley formula
    return Math.round(weight * (1 + reps / 30));
}

export function calculateVolume(weight: number, reps: number, sets: number = 1) {
    return weight * reps * sets;
}
