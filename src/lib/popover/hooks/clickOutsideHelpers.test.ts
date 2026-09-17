import { describe, it, expect, vi } from 'vitest';
import {
  isInsidePopover,
  shouldIgnoreEvent,
  isInsidePopoverOrAnchor,
} from './clickOutsideHelpers';
import { TriggerRegistry } from '../utils/triggerRegistry';

describe('clickOutsideHelpers', () => {
  it('detects when an element is inside a popover card', () => {
    const child = {
      nodeType: 1,
      closest: (sel: string) => sel.includes('.popover-card'),
      classList: { contains: () => false },
    } as unknown as Element;

    expect(isInsidePopover(child, '.popover-card')).toBe(true);

    const outside = {
      nodeType: 1,
      closest: () => null,
      classList: { contains: () => false },
    } as unknown as Element;

    expect(isInsidePopover(outside, '.popover-card')).toBe(false);
  });

  it('detects ignoreClass properly', () => {
    const ignored = {
      nodeType: 1,
      closest: (sel: string) => sel.includes('custom-ignore'),
      classList: { contains: (cls: string) => cls === 'custom-ignore' },
    } as unknown as Element;

    expect(isInsidePopover(ignored, '.popover-card', 'custom-ignore')).toBe(true);
  });

  it('checks shouldIgnoreEvent with custom ignore predicate', () => {
    class MockMouseEvent {
      readonly type = 'mousedown';
    }
    const originalMouseEvent = globalThis.MouseEvent;
    try {
      globalThis.MouseEvent = MockMouseEvent as never;
      const event = new MockMouseEvent() as unknown as MouseEvent;
      const ignoreFn = vi.fn(() => true);
      expect(shouldIgnoreEvent(event, ignoreFn)).toBe(true);
      expect(ignoreFn).toHaveBeenCalledWith(event);

      const nonIgnoreFn = vi.fn(() => false);
      expect(shouldIgnoreEvent(event, nonIgnoreFn)).toBe(false);
    } finally {
      globalThis.MouseEvent = originalMouseEvent;
    }
  });

  it('detects click inside popover or registered anchor via isInsidePopoverOrAnchor', () => {
    const anchor = {
      nodeType: 1,
      contains: (target: unknown) => target === anchor,
    } as unknown as HTMLElement;
    TriggerRegistry.register('p1', anchor);

    try {
      const eventWithAnchor = {
        composedPath: () => [anchor],
        target: anchor,
      } as unknown as Event;

      expect(isInsidePopoverOrAnchor(eventWithAnchor, '.popover-card', undefined, 'p1', null)).toBe(
        true,
      );

      const outsideEl = {
        nodeType: 1,
        closest: () => null,
        classList: { contains: () => false },
      } as unknown as Element;
      const outsideEvent = {
        composedPath: () => [outsideEl],
        target: outsideEl,
      } as unknown as Event;

      expect(isInsidePopoverOrAnchor(outsideEvent, '.popover-card', undefined, 'p1', null)).toBe(
        false,
      );
    } finally {
      TriggerRegistry.unregister('p1');
    }
  });
});
