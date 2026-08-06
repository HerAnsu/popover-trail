import { describe, it, expect } from 'vitest';
import { usePopoverTrigger, usePopoverNestedTrigger } from './usePopoverTriggers';

describe('usePopoverTriggers hook module', () => {
  it('exports trigger hook functions', () => {
    expect(typeof usePopoverTrigger).toBe('function');
    expect(typeof usePopoverNestedTrigger).toBe('function');
  });
});
