import { describe, it, expect } from 'vitest';
import type { TrailEntry } from '../../types';
import {
  isPopoverStoreEvent,
  isOpenRootEvent,
  isPushNestedEvent,
  isCloseEvent,
  isPinEvent,
  isUnpinEvent,
  isClearEvent,
  isResolveStartEvent,
  isResolveSuccessEvent,
  isResolveErrorEvent,
  isDragStartEvent,
  isDragEndEvent,
  isTimelineStep,
} from './eventGuards';

describe('eventGuards', () => {
  it('identifies PopoverStoreEvent and discriminates actions', () => {
    const rootEvt = { type: 'open_root' as const, key: 'card-1', ownerId: 'root' };
    const nestedEvt = { type: 'push_nested' as const, key: 'card-2' };
    const closeEvt = { type: 'popover:close' as const, keys: ['card-1'] };
    const pinEvt = { type: 'pin' as const, key: 'card-1' };
    const unpinEvt = { type: 'unpin' as const, key: 'card-1' };
    const clearEvt = { type: 'clear' as const };

    expect(isPopoverStoreEvent(rootEvt)).toBe(true);
    expect(isPopoverStoreEvent(closeEvt)).toBe(true);
    expect(isPopoverStoreEvent({ type: 'invalid' })).toBe(false);
    expect(isPopoverStoreEvent(null)).toBe(false);

    expect(isOpenRootEvent(rootEvt)).toBe(true);
    expect(isPushNestedEvent(nestedEvt)).toBe(true);
    expect(isCloseEvent(closeEvt)).toBe(true);
    expect(isPinEvent(pinEvt)).toBe(true);
    expect(isUnpinEvent(unpinEvt)).toBe(true);
    expect(isClearEvent(clearEvt)).toBe(true);
  });

  it('discriminates resolution, drag and timeline events', () => {
    const resStart = { type: 'resolve_start' as const, key: 'k1' };
    const resSuccess = { type: 'resolve_success' as const, key: 'k1', data: { val: 42 } };
    const resError = { type: 'resolve_error' as const, key: 'k1', error: new Error('fail') };
    const dragStart = { type: 'drag_start' as const, key: 'k1', x: 0, y: 0 };
    const dragEnd = { type: 'drag_end' as const, key: 'k1', x: 10, y: 20 };
    const step = { stepKey: 's1', entry: { key: 'k1' } as unknown as TrailEntry, timestamp: 12345 };

    expect(isResolveStartEvent(resStart)).toBe(true);
    expect(isResolveSuccessEvent(resSuccess)).toBe(true);
    expect(isResolveErrorEvent(resError)).toBe(true);
    expect(isDragStartEvent(dragStart)).toBe(true);
    expect(isDragEndEvent(dragEnd)).toBe(true);
    expect(isTimelineStep(step)).toBe(true);
    expect(isTimelineStep(null)).toBe(false);
    expect(isTimelineStep({ stepKey: 's1' })).toBe(false);
  });
});
