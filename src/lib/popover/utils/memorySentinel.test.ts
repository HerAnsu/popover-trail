import { describe, it, expect } from 'vitest';
import { trackMemoryCleanup, untrackMemoryCleanup } from './memorySentinel';

describe('memorySentinel utility', () => {
  it('tracks and untracks objects without error', () => {
    const targetObj = { id: 'popover-card-1' };
    expect(() => trackMemoryCleanup(targetObj, 'card-1')).not.toThrow();
    expect(() => untrackMemoryCleanup(targetObj)).not.toThrow();
  });

  it('handles invalid targets gracefully', () => {
    // @ts-expect-error - testing invalid primitive target
    expect(() => trackMemoryCleanup('not-an-object', 'key')).not.toThrow();
    // @ts-expect-error - testing invalid target untrack
    expect(() => untrackMemoryCleanup(null)).not.toThrow();
  });
});
