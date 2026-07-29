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

    if (isResolveSuccessEvent(successEvt)) {
      expect(successEvt.data.name).toBe('Test');
    }
  });

  it('creates typed popover controller with bounded key operations', () => {
    const store = createPopoverStore(async (key) => ({ key }));
    const controller = createPopoverController<unknown, unknown, 'card-1' | 'card-2'>(store);

    expect(controller).toBeDefined();
    expect(typeof controller.closeByKey).toBe('function');
    expect(typeof controller.togglePin).toBe('function');
  });
});
