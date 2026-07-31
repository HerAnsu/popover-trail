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

  it('supports schema creation with explicit children ancestry and const key inference', () => {
    const schema = createPopoverSchema({
      userProfile: {
        resolver: async (key) => ({ id: '123', key }),
        children: ['userStats'],
      },
      userStats: {
        resolver: async (key, _parentData) => ({ key, count: 42 }),
      },
    });

    expect(schema.definition.userProfile.children).toEqual(['userStats']);
    expect(schema.keys.userProfile).toBe('userProfile');
    expect(schema.keys.userStats).toBe('userStats');
  });

  it('filters PopoverStoreEvent correctly with isStoreEvent generic guard', async () => {
    const { isStoreEvent } = await import('./index');
    const evt: import('./types').PopoverStoreEvent<{ name: string }> = {
      type: 'resolve_success',
      key: 'card-1',
      data: { name: 'Alex' },
    };

    expect(isStoreEvent(evt, 'resolve_success')).toBe(true);
    expect(isStoreEvent(evt, 'resolve_error')).toBe(false);

    if (isStoreEvent(evt, 'resolve_success')) {
      expect(evt.data.name).toBe('Alex');
    }
  });

  it('validates toSchemaKey and InferResolverData type utilities', async () => {
    const { toSchemaKey } = await import('./index');
    const schema = createPopoverSchema({
      profile: {
        resolver: async (_key) => ({ name: 'John', age: 30 }),
      },
    });

    const validatedKey = toSchemaKey(schema, 'profile');
    expect(validatedKey).toBe('profile');

    type TestResolver = typeof schema.definition.profile.resolver;
    type ExtractedData = import('./types').InferResolverData<TestResolver>;
    const sample: ExtractedData = { name: 'John', age: 30 };
    expect(sample.name).toBe('John');
  });

  it('types OnPopoverEventMap callback map correctly', async () => {
    type SampleData = { score: number };
    let handledKey = '';

    const handlers: import('./types').OnPopoverEventMap<SampleData> = {
      onResolve_success: (evt) => {
        handledKey = evt.key;
      },
    };

    if (handlers.onResolve_success) {
      handlers.onResolve_success({
        type: 'resolve_success',
        key: 'card-99',
        data: { score: 100 },
      });
    }

    expect(handledKey).toBe('card-99');
  });

  it('binds custom app context with definePopoverContext factory', async () => {
    const { definePopoverContext } = await import('./index');
    interface CustomContext {
      tenantId: string;
    }

    const appCtx = definePopoverContext<CustomContext>();
    expect(typeof appCtx.useContext).toBe('function');
    expect(typeof appCtx.useActions).toBe('function');
    expect(typeof appCtx.useStoreApi).toBe('function');
    expect(appCtx.Provider).toBeDefined();
  });

  it('narrows PopoverTimelineStep status in history items', async () => {
    type Data = { title: string };
    const step: import('./types').PopoverTimelineStep<Data> = {
      status: 'active',
      stepIndex: 0,
      trailKeys: ['card-1'],
      pinnedKeys: [],
      primaryKey: 'card-1',
      canUndo: true,
      canRedo: false,
    };

    expect(step.status).toBe('active');
    if (step.status === 'active') {
      expect(step.canUndo).toBe(true);
      expect(step.canRedo).toBe(false);
    }
  });

  it('validates TypedMiddlewarePatch typed state patches', () => {
    type KeyUnion = 'card-1' | 'card-2';
    const patch: import('./types').TypedMiddlewarePatch<unknown, unknown, KeyUnion> = {
      cascadeOffsetStep: 16,
      targetKey: 'card-1',
    };

    expect(patch.cascadeOffsetStep).toBe(16);
    expect(patch.targetKey).toBe('card-1');
  });

  it('supports PolymorphicPropsWithRef element ref inference', () => {
    type ButtonProps = import('./components/PopoverCard').PolymorphicPropsWithRef<
      'button',
      { index: number }
    >;
    const sampleProps: ButtonProps = {
      as: 'button',
      index: 0,
      onClick: (_e) => {
        /* click handler */
      },
    };

    expect(sampleProps.as).toBe('button');
    expect(sampleProps.index).toBe(0);
  });

  it('narrows PopoverFSMState data and error in discriminated union states', async () => {
    type Data = { title: string };
    const fsmState: import('./store/fsm').PopoverFSMState<Data> = {
      value: 'Resolved.Trailing',
      context: {
        key: 'card-1',
        data: { title: 'Hello World' },
      },
    };

    expect(fsmState.value).toBe('Resolved.Trailing');
    if (fsmState.value === 'Resolved.Trailing') {
      expect(fsmState.context.data.title).toBe('Hello World');
    }
  });

  it('validates AnchorEventLike type guards isVirtualElementAnchor and isEventAnchor', async () => {
    const { isVirtualElementAnchor, isEventAnchor, createVirtualElement } = await import('./index');

    const virtualElem = createVirtualElement(10, 20, 100, 50);
    expect(isVirtualElementAnchor(virtualElem)).toBe(true);
    expect(isEventAnchor(virtualElem)).toBe(false);

    const mockElement = {
      getBoundingClientRect: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    } as unknown as HTMLElement;
    const mockEvent = { currentTarget: mockElement };
    expect(isEventAnchor(mockEvent)).toBe(true);
    expect(isVirtualElementAnchor(mockEvent)).toBe(false);
  });
});
