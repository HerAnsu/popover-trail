import { describe, it, expect } from 'vitest';
import { createPopoverTrail } from './factory';

describe('createPopoverTrail factory', () => {
  it('instantiates typed Provider, Trigger, and hook bindings without schema', () => {
    const trail = createPopoverTrail();

    expect(trail.PopoverProvider).toBeDefined();
    expect(trail.PopoverTrigger).toBeDefined();
    expect(trail.PopoverPortal).toBeDefined();
    expect(typeof trail.usePopover).toBe('function');
    expect(typeof trail.usePopoverActions).toBe('function');
    expect(typeof trail.usePopoverContext).toBe('function');
  });

  it('instantiates schema instance when schema definition object is passed', () => {
    const schema = createPopoverTrail({
      profile: {
        resolver: async () => ({ name: 'Alice' }),
      },
    });

    expect(schema.keys).toEqual({ profile: 'profile' });
    expect(typeof schema.createResolver).toBe('function');
    expect(schema.Trigger).toBeDefined();
    expect(schema.PopoverProvider).toBeDefined();
  });
});
