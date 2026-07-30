import { describe, it, expect } from 'vitest';
import {
  definePopoverConfig,
  definePopoverMiddleware,
  toViewportX,
  toViewportY,
  assertPopoverFSMState,
  createPopoverFSM,
  createPopoverSchema,
  type PopoverStateData,
} from './index';

describe('Advanced Type Safety & Helpers', () => {
  it('preserves literal types with definePopoverConfig helper', () => {
    const config = definePopoverConfig({
      placement: 'right-start',
      cascadeOffsetStep: 12,
      keyboardShortcuts: {
        Escape: (_key) => {
          /* no-op handler */
        },
      },
    });

    expect(config.placement).toBe('right-start');
    expect(config.cascadeOffsetStep).toBe(12);
  });

  it('validates state patches with definePopoverMiddleware helper', () => {
    const mw = definePopoverMiddleware((patch, _state) => {
      if (patch.cascadeOffsetStep) {
        return { ...patch, cascadeOffsetStep: 16 };
      }
      return patch;
    });

    const mockState = {
      trail: [],
      floating: [],
      ownerId: null,
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      rootHydrationRequestCounter: 0,
    } as unknown as PopoverStateData;
    const result = mw({ cascadeOffsetStep: 12 }, mockState);
    expect(result).toEqual({ cascadeOffsetStep: 16 });
  });

  it('creates branded ViewportX and ViewportY coordinates', () => {
    const x = toViewportX(150);
    const y = toViewportY(300);

    expect(x).toBe(150);
    expect(y).toBe(300);
  });

  it('asserts FSM state transitions correctly', () => {
    const fsm = createPopoverFSM('card-1');
    expect(() => assertPopoverFSMState(fsm.getState(), 'Idle')).not.toThrow();
    expect(() => assertPopoverFSMState(fsm.getState(), 'Error')).toThrow(
      '[popover-trail FSM assertion error]',
    );
  });

  it('supports schema creation with explicit children ancestry', () => {
    const schema = createPopoverSchema({
      userProfile: {
        resolver: async (key) => ({ id: '123', key }),
        children: ['userStats'] as const,
      },
      userStats: {
        resolver: async (key, _parentData) => ({ key, count: 42 }),
      },
    });

    expect(schema.definition.userProfile.children).toEqual(['userStats']);
    expect(schema.keys.userProfile).toBe('userProfile');
    expect(schema.keys.userStats).toBe('userStats');
  });
});
