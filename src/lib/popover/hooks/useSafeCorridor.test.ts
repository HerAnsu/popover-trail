import { describe, it, expect } from 'vitest';
import { useSafeCorridor } from './useSafeCorridor';

describe('useSafeCorridor hook', () => {
  it('exports useSafeCorridor hook function', () => {
    expect(typeof useSafeCorridor).toBe('function');
  });
});
