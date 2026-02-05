import { describe, it, expect } from 'vitest';
import { getExercisesToSave } from './workout-helpers';
import type { ActiveExercise, WorkoutSet } from './stores/workout-session';

function createMockSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
    return {
        id: 'test-id',
        weight: '',
        reps: '',
        rir: '',
        completed: false,
        ...overrides
    };
}

function createBaseExercise(): ActiveExercise {
    return {
        id: 'ex1',
        name: 'Bench Press',
        sets: [],
        originalSets: 1,
        muscleGroup: [],
        equipment: [],
        technique: [],
        description: '',
        repRange: '',
        rest: ''
    };
}

describe('getExercisesToSave', () => {
    it('should save completed sets', () => {
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: true, weight: '100', reps: '10' })]
        }]);
        expect(result).toHaveLength(1);
        expect(result[0].sets[0]).toEqual(expect.objectContaining({ weight: "100", reps: 10 }));
    });

    it('should save uncompleted sets with ONLY weight', () => {
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: false, weight: '50', reps: '' })]
        }]);
        expect(result).toHaveLength(1);
        expect(result[0].sets[0]).toEqual(expect.objectContaining({ weight: "50", reps: 0 }));
    });

    it('should save uncompleted sets with ONLY reps', () => {
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: false, weight: '', reps: '12' })]
        }]);
        expect(result).toHaveLength(1);
        expect(result[0].sets[0]).toEqual(expect.objectContaining({ weight: "", reps: 12 }));
    });

    it('should save uncompleted sets with Weight AND Reps', () => {
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: false, weight: '60', reps: '8' })]
        }]);
        expect(result).toHaveLength(1);
        expect(result[0].sets[0]).toEqual(expect.objectContaining({ weight: "60", reps: 8 }));
    });

    it('should save uncompleted sets with Weight, Reps AND RIR', () => {
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: false, weight: '80', reps: '5', rir: '2' })]
        }]);
        expect(result).toHaveLength(1);
        expect(result[0].sets[0]).toEqual(expect.objectContaining({ weight: "80", reps: 5, rir: 2 }));
    });

    it('should save sets with decimal weights', () => {
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: false, weight: '22.5', reps: '10' })]
        }]);
        expect(result).toHaveLength(1);
        expect(result[0].sets[0].weight).toBe("22.5");
    });

    it('should save sets with "0" weight (bodyweight exercises)', () => {
        // e.g. Pullups with 0 added weight but 10 reps
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: false, weight: '0', reps: '10' })]
        }]);
        expect(result).toHaveLength(1);
        expect(result[0].sets[0]).toEqual(expect.objectContaining({ weight: "0", reps: 10 }));
    });

    it('should NOT save empty uncompleted sets (no weight, no reps)', () => {
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: false, weight: '', reps: '', rir: '' })]
        }]);
        expect(result).toHaveLength(0);
    });

    it('should NOT save uncompleted sets with only RIR (meaningless data)', () => {
        // RIR without reps/weight shouldn't be valid
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [createMockSet({ completed: false, weight: '', reps: '', rir: '2' })]
        }]);
        expect(result).toHaveLength(0);
    });

    it('should process mixed sets (valid and invalid)', () => {
        const result = getExercisesToSave([{
            ...createBaseExercise(),
            sets: [
                createMockSet({ completed: true, weight: '100', reps: '10' }), // Keep
                createMockSet({ completed: false, weight: '', reps: '' }),     // Drop
                createMockSet({ completed: false, weight: '50', reps: '' })    // Keep
            ]
        }]);
        expect(result).toHaveLength(1);
        expect(result[0].sets).toHaveLength(2);
        expect(result[0].sets[0].weight).toBe("100");
        expect(result[0].sets[1].weight).toBe("50");
    });
});
