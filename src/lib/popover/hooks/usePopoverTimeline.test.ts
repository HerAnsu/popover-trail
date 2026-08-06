import { describe, it, expect } from 'vitest';
import { usePopoverTimeline } from './usePopoverTimeline';

describe('usePopoverTimeline hook', () => {
  it('exports usePopoverTimeline hook function', () => {
    expect(typeof usePopoverTimeline).toBe('function');
  });
});
