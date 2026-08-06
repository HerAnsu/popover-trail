import { describe, it, expect } from 'vitest';
import { useClickOutside } from './useClickOutside';

describe('useClickOutside hook', () => {
  it('exports useClickOutside hook function', () => {
    expect(typeof useClickOutside).toBe('function');
  });
});
