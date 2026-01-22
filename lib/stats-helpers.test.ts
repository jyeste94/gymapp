import { describe, it, expect } from 'vitest';
import { calculateStats } from './stats-helpers';
import type { RoutineLog } from './types';

function createMockLog(date: string, weight = 100, reps = 10): RoutineLog {
    return {
        id: 'log1',
        date,
        entries: [{
            exerciseId: 'ex1',
            exerciseName: 'Squat',
            sets: [{ weight, reps }]
        }]
    };
}

describe('Stats Helpers', () => {
    describe('calculateStats', () => {
        it('should calculate correct total volume', () => {
            const logs = [
                createMockLog('2024-01-01', 100, 10), // 1000 vol
                createMockLog('2024-01-02', 50, 10)   // 500 vol
            ];
            const stats = calculateStats(logs);
            expect(stats.totalVolume).toBe(1500);
        });

        it('should handle logs with no sets', () => {
            const logs = [{ id: 'empty', date: '2024-01-01', entries: [] }];
            const stats = calculateStats(logs);
            expect(stats.totalVolume).toBe(0);
        });

        it('should correctly count total workouts', () => {
            const logs = [
                createMockLog('2024-01-01'),
                createMockLog('2024-01-02'),
                createMockLog('2024-01-03')
            ];
            expect(calculateStats(logs).totalWorkouts).toBe(3);
        });

        it('should identify the last workout date (assuming sorted input)', () => {
            const logs = [
                createMockLog('2024-01-03'), // First in array = most recent
                createMockLog('2024-01-01')
            ];
            expect(calculateStats(logs).lastWorkoutDate).toBe('2024-01-03');
        });
    });
});
