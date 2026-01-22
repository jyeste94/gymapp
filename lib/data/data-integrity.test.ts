import { describe, it, expect } from 'vitest';
import { defaultExercises } from './exercises';
import type { MuscleGroup, Equipment } from '../types';

describe('Data Integrity: Exercise Catalog', () => {
    it('should have unique IDs for all exercises', () => {
        const ids = defaultExercises.map(e => e.id);
        const uniqueIds = new Set(ids);

        if (ids.length !== uniqueIds.size) {
            const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
            console.error('Duplicate IDs found:', duplicates);
        }

        expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid muscle groups', () => {
        const validMuscles: MuscleGroup[] = [
            'Pecho', 'Espalda', 'Hombro', 'Biceps', 'Triceps',
            'Cuadriceps', 'Isquios', 'Gluteos', 'Gemelos', 'Core', 'Trapecio'
        ];

        defaultExercises.forEach(exercise => {
            exercise.muscleGroup.forEach(muscle => {
                expect(validMuscles).toContain(muscle);
            });
        });
    });

    it('should have valid equipment', () => {
        const validEquipment: Equipment[] = [
            'Barra', 'Mancuernas', 'Polea', 'Maquina', 'Peso corporal'
        ];

        defaultExercises.forEach(exercise => {
            exercise.equipment.forEach(eq => {
                expect(validEquipment).toContain(eq);
            });
        });
    });

    it('should have valid URLs for images and videos', () => {
        defaultExercises.forEach(exercise => {
            if (exercise.image) {
                expect(exercise.image).toMatch(/^https?:\/\//);
            }
            if (exercise.video) {
                expect(exercise.video).toMatch(/^https?:\/\//);
            }
        });
    });
});
