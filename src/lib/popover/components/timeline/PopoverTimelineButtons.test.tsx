import { describe, it, expect } from 'vitest';
import { PopoverTimelineUndoButton, PopoverTimelineRedoButton } from './PopoverTimelineButtons';

describe('PopoverTimelineButtons subcomponents', () => {
  it('exports PopoverTimelineUndoButton and PopoverTimelineRedoButton functions', () => {
    expect(typeof PopoverTimelineUndoButton).toBe('function');
    expect(typeof PopoverTimelineRedoButton).toBe('function');
  });
});
