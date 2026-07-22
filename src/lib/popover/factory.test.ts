import { describe, it, expect } from 'vitest';
import { createPopoverTrail } from './factory';

describe('createPopoverTrail factory', () => {
  it('instantiates typed Provider, Trigger, and hook bindings', () => {
    interface CustomData {
      title: string;
      value: number;
    }

    interface CustomContext {
      theme: string;
    }

    type CustomKeys = 'header-popover' | 'sidebar-popover';

    const trail = createPopoverTrail<CustomData, CustomContext, CustomKeys>();

    expect(trail.PopoverProvider).toBeDefined();
    expect(trail.PopoverTrigger).toBeDefined();
    expect(trail.PopoverPortal).toBeDefined();
    expect(typeof trail.usePopover).toBe('function');
    expect(typeof trail.usePopoverActions).toBe('function');
    expect(typeof trail.usePopoverContext).toBe('function');
  });
});
