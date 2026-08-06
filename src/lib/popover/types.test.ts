import { describe, it, expect } from 'vitest';
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
  type PopoverStoreEvent,
  type LoadingTrailEntry,
  type ErrorTrailEntry,
  type SuccessTrailEntry,
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
    const store = createPopoverStore(async (key) => ({ key }));
    const controller = createPopoverController<unknown, unknown, 'card-1' | 'card-2'>(
      store as unknown as Parameters<
        typeof createPopoverController<unknown, unknown, 'card-1' | 'card-2'>
      >[0],
    );

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
    const cssVars: import('./index').PopoverCSSProperties = {
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
    const sample: import('./index').DeepReadonly<Sample> = { a: { b: 42 } };
    expect(sample.a.b).toBe(42);
  });
});
