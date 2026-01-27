import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkoutStore } from './workout-session';
import type { RoutineExercise } from '../types';

// Helper to create a dummy exercises
const createMockRoutineExercise = (): RoutineExercise => ({
    id: 'ex1',
    name: 'Squat',
    sets: 3,
    repRange: '5',
    rest: '120s',
    muscleGroup: ['Cuadriceps'],
    equipment: ['Barra'],
    technique: [],
    description: 'Barbell Squat',
    image: '',
    video: ''
});

describe('Workout Store', () => {
    // Reset store before each test
    beforeEach(() => {
        useWorkoutStore.persist.clearStorage();
        useWorkoutStore.setState({
            startTime: null,
            routineId: null,
            routineTitle: null,
            dayId: null,
            dayTitle: null,
            exercises: [],
            activeExerciseId: null
        });
    });

    it('should start a workout correctly', () => {
        const store = useWorkoutStore.getState();
        const exercises = [createMockRoutineExercise()];

        store.startWorkout({
            routineId: 'r1',
            routineTitle: 'Leg Day',
            dayId: 'd1',
            dayTitle: 'Day 1',
            exercises
        });

        const state = useWorkoutStore.getState();
        expect(state.startTime).toBeTruthy(); // Should be a valid timestamp
        expect(state.routineTitle).toBe('Leg Day');
        expect(state.exercises).toHaveLength(1);
        expect(state.exercises[0].sets).toHaveLength(3); // 3 sets by default from mock
        expect(state.activeExerciseId).toBe('ex1');
    });

    it('should update a set', () => {
        const store = useWorkoutStore.getState();
        store.startWorkout({
            routineId: 'r1',
            routineTitle: 'Test',
            dayId: 'd1',
            dayTitle: 'Test',
            exercises: [createMockRoutineExercise()]
        });

        const setId = useWorkoutStore.getState().exercises[0].sets[0].id;

        store.updateSet('ex1', setId, { weight: '100', reps: '5' });

        const updatedSet = useWorkoutStore.getState().exercises[0].sets[0];
        expect(updatedSet.weight).toBe('100');
        expect(updatedSet.reps).toBe('5');
    });

    it('should toggle set completion', () => {
        const store = useWorkoutStore.getState();
        store.startWorkout({
            routineId: 'r1', routineTitle: 'T', dayId: 'd1', dayTitle: 'T',
            exercises: [createMockRoutineExercise()]
        });

        const setId = useWorkoutStore.getState().exercises[0].sets[0].id;

        // Toggle ON
        store.toggleSetComplete('ex1', setId);
        expect(useWorkoutStore.getState().exercises[0].sets[0].completed).toBe(true);

        // Toggle OFF
        store.toggleSetComplete('ex1', setId);
        expect(useWorkoutStore.getState().exercises[0].sets[0].completed).toBe(false);
    });

    it('should add a new set', () => {
        const store = useWorkoutStore.getState();
        store.startWorkout({
            routineId: 'r1', routineTitle: 'T', dayId: 'd1', dayTitle: 'T',
            exercises: [createMockRoutineExercise()]
        });

        const initialLength = useWorkoutStore.getState().exercises[0].sets.length;

        store.addSet('ex1');

        const newLength = useWorkoutStore.getState().exercises[0].sets.length;
        expect(newLength).toBe(initialLength + 1);
    });

    it('should remove a set', () => {
        const store = useWorkoutStore.getState();
        store.startWorkout({
            routineId: 'r1', routineTitle: 'T', dayId: 'd1', dayTitle: 'T',
            exercises: [createMockRoutineExercise()]
        });

        const setId = useWorkoutStore.getState().exercises[0].sets[0].id;
        store.removeSet('ex1', setId);

        const exercises = useWorkoutStore.getState().exercises[0];
        expect(exercises.sets.find(s => s.id === setId)).toBeUndefined();
    });

    it('should finish/cancel workout (reset state)', () => {
        const store = useWorkoutStore.getState();
        store.startWorkout({
            routineId: 'r1', routineTitle: 'T', dayId: 'd1', dayTitle: 'T',
            exercises: [createMockRoutineExercise()]
        });

        store.finishWorkout();

        const state = useWorkoutStore.getState();
        expect(state.startTime).toBeNull();
        expect(state.exercises).toHaveLength(0);
        expect(state.routineId).toBeNull();
    });
    it('should pre-fill weights from history', () => {
        const store = useWorkoutStore.getState();
        const exercises = [createMockRoutineExercise()];
        const history = {
            'ex1': [
                { weight: '100', reps: '5' },
                { weight: '105', reps: '5' },
                { weight: '110', reps: '5' }
            ]
        };

        store.startWorkout({
            routineId: 'r1',
            routineTitle: 'Leg Day',
            dayId: 'd1',
            dayTitle: 'Day 1',
            exercises,
            history
        });

        const state = useWorkoutStore.getState();
        const sets = state.exercises[0].sets;

        expect(sets[0].weight).toBe('100');
        expect(sets[1].weight).toBe('105');
        expect(sets[2].weight).toBe('110');

        // Reps should NOT be pre-filled
        expect(sets[0].reps).toBe('');
    });

    it('should pre-fill with last valid weight if history is shorter than current sets', () => {
        const store = useWorkoutStore.getState();
        const exercises = [{ ...createMockRoutineExercise(), sets: 4 }]; // 4 Sets
        const history = {
            'ex1': [
                { weight: '50', reps: '10' }, // Set 1
                { weight: '55', reps: '10' }  // Set 2
                // Set 3 & 4 missing
            ]
        };

        store.startWorkout({
            routineId: 'r1',
            routineTitle: 'Leg Day',
            dayId: 'd1',
            dayTitle: 'Day 1',
            exercises,
            history
        });

        const state = useWorkoutStore.getState();
        const sets = state.exercises[0].sets;

        expect(sets[0].weight).toBe('50');
        expect(sets[1].weight).toBe('55');
        expect(sets[2].weight).toBe('55'); // Should use last valid weight (55)
        expect(sets[3].weight).toBe('55'); // Should use last valid weight (55)
    });
});
