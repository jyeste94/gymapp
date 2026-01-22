import { describe, it, expect } from 'vitest';
import { calculateOneRM, calculateVolume } from './fitness-utils';

describe('Fitness Utils', () => {
    describe('calculateOneRM (Epley Formula)', () => {
        it('should return exact weight for 1 rep', () => {
            expect(calculateOneRM(100, 1)).toBe(100);
        });

        it('should calculate correct 1RM for standard reps', () => {
            // Epley: 100 * (1 + 10/30) = 100 * 1.333 = 133.3 -> round to 133
            expect(calculateOneRM(100, 10)).toBe(133);
        });

        it('should handle bodyweight (0kg) correctly', () => {
            expect(calculateOneRM(0, 10)).toBe(0);
        });

        it('should handle high reps', () => {
            // 60kg * (1 + 20/30) = 60 * 1.666 = 100
            expect(calculateOneRM(60, 20)).toBe(100);
        });
    });

    describe('calculateVolume', () => {
        it('should calculate basic volume (w * r * s)', () => {
            expect(calculateVolume(100, 10, 3)).toBe(3000);
        });

        it('should default to 1 set if omitted', () => {
            expect(calculateVolume(50, 10)).toBe(500);
        });

        it('should return 0 if weight is 0', () => {
            expect(calculateVolume(0, 10, 3)).toBe(0);
        });

        it('should return 0 if reps are 0', () => {
            expect(calculateVolume(100, 0, 3)).toBe(0);
        });
    });
});
