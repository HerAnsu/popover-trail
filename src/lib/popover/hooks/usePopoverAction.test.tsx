import { describe, it, expect } from 'vitest';
import { usePopoverAction } from './usePopoverAction';
import { usePopoverOptimistic, usePopoverCardOptimistic } from './usePopoverOptimistic';

describe('React 19 Action and Optimistic hooks', () => {
  it('exports usePopoverAction hook function', () => {
    expect(typeof usePopoverAction).toBe('function');
  });

  it('exports usePopoverOptimistic and usePopoverCardOptimistic hook functions', () => {
    expect(typeof usePopoverOptimistic).toBe('function');
    expect(typeof usePopoverCardOptimistic).toBe('function');
  });
});
