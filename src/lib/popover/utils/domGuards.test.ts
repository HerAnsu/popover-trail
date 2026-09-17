import { describe, it, expect } from 'vitest';
import {
  escapeSelector,
  isClickInsidePortal,
  isClickOnIgnoredTrigger,
  findNextFocusable,
} from './domGuards';
import { DATA_POPOVER_PORTAL } from '../constants';

describe('domGuards utility', () => {
  it('memoizes escaped selectors', () => {
    const escaped1 = escapeSelector('item:1');
    const escaped2 = escapeSelector('item:1');
    expect(escaped1).toBe(escaped2);
    expect(escaped1).toBe('item:1');
  });

  it('checks if click is inside portal element via composedPath mock', () => {
    const mockTarget = {
      nodeType: 1,
      getAttribute: (attr: string) => (attr === DATA_POPOVER_PORTAL ? 'my-portal' : null),
      hasAttribute: (attr: string) => attr === DATA_POPOVER_PORTAL,
    } as unknown as Element;

    const mockEvent = {
      composedPath: () => [mockTarget],
    } as unknown as Event;

    expect(isClickInsidePortal(mockEvent, 'my-portal')).toBe(true);
    expect(isClickInsidePortal(mockEvent, 'other-portal')).toBe(false);
  });

  it('checks if click is on trigger or ignored element', () => {
    const trigger = { nodeType: 1 } as unknown as HTMLElement;
    const mockEvent = {
      composedPath: () => [trigger],
    } as unknown as Event;

    expect(isClickOnIgnoredTrigger(mockEvent, trigger)).toBe(true);

    const otherTrigger = { nodeType: 1 } as unknown as HTMLElement;
    expect(isClickOnIgnoredTrigger(mockEvent, otherTrigger)).toBe(false);
  });

  it('handles findNextFocusable with mock container', () => {
    const mockContainer = {
      querySelectorAll: () => [],
    } as unknown as HTMLElement;
    expect(findNextFocusable(mockContainer)).toBeNull();
  });
});
