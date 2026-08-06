import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverCard, PopoverCanvas, usePopoverDraggableCard } from './dnd';

describe('dnd kit integration module', () => {
  it('exports PopoverCard and PopoverCanvas components', () => {
    expect(PopoverCard).toBeDefined();
    expect(PopoverCanvas).toBeDefined();
    expect(typeof usePopoverDraggableCard).toBe('function');
  });

  it('instantiates PopoverCanvas element safely', () => {
    const el = <PopoverCanvas>{() => <div>Canvas Item</div>}</PopoverCanvas>;
    expect(React.isValidElement(el)).toBe(true);
  });
});
