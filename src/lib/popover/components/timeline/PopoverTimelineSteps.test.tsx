import { describe, it, expect } from 'vitest';
import { PopoverTimelineStepList, PopoverTimelineStep } from './PopoverTimelineSteps';

describe('PopoverTimelineSteps subcomponents', () => {
  it('exports PopoverTimelineStepList and PopoverTimelineStep functions', () => {
    expect(typeof PopoverTimelineStepList).toBe('function');
    expect(typeof PopoverTimelineStep).toBe('function');
  });
});
