import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('General Utils', () => {
    describe('cn (Tailwind Merge)', () => {
        it('should merge classes correctly', () => {
            expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500');
        });

        it('should handle conditional classes', () => {
            expect(cn('p-4', true && 'bg-red-500', false && 'hidden')).toBe('p-4 bg-red-500');
        });

        it('should resolve conflicting tailwind classes (last wins)', () => {
            // p-4 is padding: 1rem; p-8 is padding: 2rem. tailwind-merge should keep p-8.
            expect(cn('p-4', 'p-8')).toBe('p-8');
        });

        it('should handle arrays and objects if supported by clsx', () => {
            expect(cn(['text-center', 'font-bold'])).toBe('text-center font-bold');
        });
    });
});
