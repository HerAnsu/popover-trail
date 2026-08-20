import { describe, it, expect } from 'vitest';
import { useCrossVersionActionState, useCrossVersionOptimistic } from './react19Adapters';

describe('React 18 / React 19 Adapters', () => {
  it('exports useCrossVersionActionState function', () => {
    expect(typeof useCrossVersionActionState).toBe('function');
  });

  it('exports useCrossVersionOptimistic function', () => {
    expect(typeof useCrossVersionOptimistic).toBe('function');
  });
});
