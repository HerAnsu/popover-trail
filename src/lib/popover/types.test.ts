import { describe, it, expect } from 'vitest';
import * as PopoverLib from './index';
import {
  isOpenRootEvent,
  isPushNestedEvent,
  isCloseEvent,
  isUnpinEvent,
  isResolveStartEvent,
  isResolveSuccessEvent,
  isResolveErrorEvent,
  isClearEvent,
  createPopoverController,
  createPopoverStore,
  matchEntryState,
  defineStoreSlice,
  type PopoverStoreEvent,
  type LoadingTrailEntry,
  type ErrorTrailEntry,
  type SuccessTrailEntry,
  type PopoverCSSProperties,
  type DeepReadonly,
  type PopoverEntryDiscriminatedState,
} from './index';

describe('Type Safety Guards & Event Predicates', () => {
  it('correctly narrows open_root event', () => {
    const event: PopoverStoreEvent<{ id: number }> = {
      type: 'open_root',
      key: 'root-1',
      ownerId: 'owner-1',
    };
    expect(isOpenRootEvent(event)).toBe(true);
    expect(isCloseEvent(event)).toBe(false);
  });

  it('correctly narrows push_nested event', () => {
    const event: PopoverStoreEvent<{ id: number }> = {
      type: 'push_nested',
      key: 'child-1',
      parentKey: 'root-1',
    };
    expect(isPushNestedEvent(event)).toBe(true);
    expect(isOpenRootEvent(event)).toBe(false);
  });

  it('correctly narrows unpin, resolve_start, resolve_success and clear events', () => {
    const unpinEvt: PopoverStoreEvent<{ name: string }> = { type: 'unpin', key: 'card-1' };
    const startEvt: PopoverStoreEvent<{ name: string }> = { type: 'resolve_start', key: 'card-1' };
    const successEvt: PopoverStoreEvent<{ name: string }> = {
      type: 'resolve_success',
      key: 'card-1',
      data: { name: 'Test' },
    };
    const errorEvt: PopoverStoreEvent<{ name: string }> = {
      type: 'resolve_error',
      key: 'card-1',
      error: new Error('Failed'),
    };
    const clearEvt: PopoverStoreEvent<{ name: string }> = { type: 'clear' };

    expect(isUnpinEvent(unpinEvt)).toBe(true);
    expect(isResolveStartEvent(startEvt)).toBe(true);
    expect(isResolveSuccessEvent(successEvt)).toBe(true);
    expect(isResolveErrorEvent(errorEvt)).toBe(true);
    expect(isClearEvent(clearEvt)).toBe(true);

    if (isResolveSuccessEvent<{ name: string }>(successEvt)) {
      expect(successEvt.data.name).toBe('Test');
    }
  });

  it('creates typed popover controller with bounded key operations', () => {
    const store = createPopoverStore<unknown, unknown, 'card-1' | 'card-2'>(
      async (key: string) => ({
        key,
      }),
    );
    const controller = createPopoverController(store);

    expect(controller).toBeDefined();
    expect(typeof controller.closeByKey).toBe('function');
    expect(typeof controller.togglePin).toBe('function');
  });

  it('validates Discriminated TrailEntry subtypes', () => {
    type Data = { title: string };
    const loading: LoadingTrailEntry<Data> = {
      key: 'k1',
      status: 'loading',
      isLoading: true,
      data: undefined,
      error: null,
    };
    const err: ErrorTrailEntry<Data> = {
      key: 'k2',
      status: 'error',
      isLoading: false,
      data: undefined,
      error: new Error('Failed'),
    };
    const ok: SuccessTrailEntry<Data> = {
      key: 'k3',
      status: 'success',
      isLoading: false,
      data: { title: 'Success' },
      error: null,
    };

    expect(loading.isLoading).toBe(true);
    expect(err.error.message).toBe('Failed');
    expect(ok.data.title).toBe('Success');
  });

  it('supports PopoverCSSProperties for CSS variable styling', () => {
    const cssVars: PopoverCSSProperties = {
      '--popover-z-index': 1000,
      '--popover-offset-x': '20px',
      '--popover-offset-y': 15,
      color: 'red',
    };

    expect(cssVars['--popover-z-index']).toBe(1000);
    expect(cssVars.color).toBe('red');
  });

  it('validates DeepReadonly type helper immutability', () => {
    type Sample = { a: { b: number } };
    const sample: DeepReadonly<Sample> = { a: { b: 42 } };
    expect(sample.a.b).toBe(42);
  });

  it('executes pattern matching over PopoverEntryDiscriminatedState using matchEntryState', () => {
    const loadingState: PopoverEntryDiscriminatedState<string> = {
      status: 'loading',
      isLoading: true,
      data: undefined,
      error: null,
    };

    const result = matchEntryState(loadingState, {
      loading: () => 'is-loading',
      error: () => 'is-error',
      success: (s) => `is-success:${s.data}`,
    });

    expect(result).toBe('is-loading');
  });

  it('instantiates store slice descriptors using defineStoreSlice helper', () => {
    const descriptor = defineStoreSlice({
      name: 'customSlice',
      create: () => ({ customAction: () => true }),
    });

    expect(descriptor.name).toBe('customSlice');
    expect(typeof descriptor.create).toBe('function');
  });

  it('validates advanced store and event type helper signatures', () => {
    type Key = PopoverLib.PopoverKey;
    const testKey: Key = PopoverLib.createPopoverKey('test-key');
    expect(testKey).toBe('test-key');

    const action: PopoverLib.StoreActionPayload<string> = { type: 'CLOSE_BY_KEY', key: 'card-1' };
    expect(action.type).toBe('CLOSE_BY_KEY');

    const domainKey: PopoverLib.DomainPopoverKey<'user', 'profile'> = 'user:profile';
    expect(domainKey).toBe('user:profile');

    const eventName: PopoverLib.PopoverStoreEventName = 'popover:open_root';
    expect(eventName).toBe('popover:open_root');

    const eventMap: Partial<PopoverLib.PopoverStoreEventMap<string>> = {
      clear: { type: 'clear' },
    };
    expect(eventMap.clear?.type).toBe('clear');

    const onEventMap: PopoverLib.OnPopoverEventMap<string> = {
      listener: (_e) => {},
    };
    expect(typeof onEventMap.listener).toBe('function');

    const step: PopoverLib.ActiveTimelineStep<string> = {
      stepKey: 's1',
      entry: { key: 'k1', status: 'loading', isLoading: true, error: null, data: null },
      timestamp: 100,
    };
    expect(step.stepKey).toBe('s1');

    const undone: PopoverLib.UndoneTimelineStep<string> = {
      stepKey: 'u1',
      entry: { key: 'k1', status: 'loading', isLoading: true, error: null, data: null },
      timestamp: 100,
    };
    expect(undone.stepKey).toBe('u1');

    const config: PopoverLib.PopoverConfig<string> = {
      closePinnedDescendants: true,
    };
    expect(config.closePinnedDescendants).toBe(true);

    const tokens: PopoverLib.PopoverThemeTokens = {
      baseZIndex: 1000,
      cardShadow: 'none',
    };
    expect(tokens.baseZIndex).toBe(1000);
  });
});
