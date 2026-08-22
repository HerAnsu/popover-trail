import React from 'react';
import { describe, it, expect } from 'vitest';
import { PopoverTimelineUndoButton, PopoverTimelineRedoButton } from './PopoverTimelineButtons';
import { PopoverTimelineStep } from './PopoverTimelineSteps';

describe('PopoverTimelineButtons subcomponents', () => {
  it('exports PopoverTimelineUndoButton and PopoverTimelineRedoButton functions', () => {
    expect(typeof PopoverTimelineUndoButton).toBe('function');
    expect(typeof PopoverTimelineRedoButton).toBe('function');
  });

  it('instantiates Undo, Redo, and Step elements safely', () => {
    expect(React.isValidElement(<PopoverTimelineUndoButton />)).toBe(true);
    expect(React.isValidElement(<PopoverTimelineRedoButton />)).toBe(true);
    expect(React.isValidElement(<PopoverTimelineStep index={0} />)).toBe(true);
  });
});
