import { describe, it, expect } from 'vitest';
import { validateRoutineForm, buildRoutinePayload, type RoutineFormState } from './routine-helpers';
import type { RoutineExercise } from './types';

// Helper to create a valid exercise
const createMockExercise = (): RoutineExercise => ({
    id: 'ex1',
    name: 'Push Up',
    sets: 3,
    repRange: '10-12',
    rest: '60s',
    muscleGroup: ['Pecho'],
    equipment: ['Peso corporal'],
    technique: [],
    description: 'Basic push up'
});

// Helper to create a basic valid form state
const createValidForm = (): RoutineFormState => ({
    title: 'My Routine',
    description: 'A test routine',
    focus: 'Strength',
    level: 'Intermedio',
    frequency: '3 days',
    equipment: 'Barra',
    days: [{
        id: 'day1',
        title: 'Day 1',
        focus: 'Chest',
        notes: '',
        exercises: [createMockExercise()]
    }]
});

describe('Routine Creation Logic', () => {
    describe('validateRoutineForm', () => {
        it('should return error if user is not logged in', () => {
            const form = createValidForm();
            const error = validateRoutineForm(form, null);
            expect(error).toBe("Inicia sesion para crear tus rutinas.");
        });

        it('should return error if title is too short', () => {
            const form = { ...createValidForm(), title: 'Ab' };
            const error = validateRoutineForm(form, 'user123');
            expect(error).toBe("El nombre es demasiado corto.");
        });

        it('should return error if any day has NO exercises', () => {
            const form = {
                ...createValidForm(),
                days: [{
                    id: 'day1',
                    title: 'Day 1',
                    focus: '',
                    notes: '',
                    exercises: [] // Empty exercises
                }]
            };
            const error = validateRoutineForm(form, 'user123');
            expect(error).toBe("Cada dia debe tener al menos un ejercicio.");
        });

        it('should return null (valid) for correct form', () => {
            const form = createValidForm();
            const error = validateRoutineForm(form, 'user123');
            expect(error).toBeNull();
        });
    });

    describe('buildRoutinePayload', () => {
        it('should transform form state to payload correctly', () => {
            const form = createValidForm();
            const payload = buildRoutinePayload(form);

            expect(payload).toEqual({
                title: 'My Routine',
                description: 'A test routine',
                goal: 'Strength',
                level: 'Intermedio',
                frequency: '3 days',
                equipment: ['Barra'],
                days: [{
                    id: 'day1',
                    title: 'Day 1',
                    focus: 'Chest',
                    notes: undefined, // Empty string becomes undefined
                    warmup: [],
                    finisher: [],
                    exercises: expect.any(Array)
                }]
            });
        });

        it('should parse equipment string into array', () => {
            const form = { ...createValidForm(), equipment: 'Barra, Mancuernas,  Polea ' };
            const payload = buildRoutinePayload(form);
            expect(payload.equipment).toEqual(['Barra', 'Mancuernas', 'Polea']);
        });

        it('should handle undefined optional fields', () => {
            const form = {
                ...createValidForm(),
                description: '',
                focus: '',
                days: [{
                    id: 'day1',
                    title: '', // Should fallback to 'Dia 1'
                    focus: '',
                    notes: '',
                    exercises: [createMockExercise()]
                }]
            };
            const payload = buildRoutinePayload(form);

            expect(payload.description).toBe('');
            expect(payload.goal).toBeUndefined();
            expect(payload.days[0].title).toBe('Dia 1');
            expect(payload.days[0].focus).toBeUndefined();
        });
    });
});
