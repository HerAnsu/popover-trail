import { describe, it, expect } from 'vitest';
import { useEventListener } from './useEventListener';

describe('useEventListener hook', () => {
  it('exports useEventListener hook function', () => {
    expect(typeof useEventListener).toBe('function');
  });
});
