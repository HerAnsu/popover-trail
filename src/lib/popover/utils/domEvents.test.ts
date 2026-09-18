import { describe, it, expect, vi } from 'vitest';
import { getEventPath, getEventTarget, isPortalOrExcludedTarget } from './domEvents';
import { isElementLike } from './typeGuards';
import { DATA_POPOVER_PORTAL, DATA_POPOVER_IGNORE_OUTSIDE } from '../constants';

function createMockElement(attributes: Record<string, string> = {}): Element {
  return {
    nodeType: 1,
    hasAttribute: (name: string) => Object.hasOwn(attributes, name),
    getAttribute: (name: string) => attributes[name] ?? null,
  } as unknown as Element;
}

describe('domEvents', () => {
  describe('getEventPath', () => {
    it('uses composedPath when available on event', () => {
      const el1 = createMockElement();
      const el2 = createMockElement();
      const event = {
        composedPath: vi.fn(() => [el1, el2]),
        target: el1,
      } as unknown as Event;

      const path = getEventPath(event);
      expect(path).toEqual([el1, el2]);
      expect(event.composedPath).toHaveBeenCalledTimes(1);
    });

    it('falls back to target array when composedPath is not available', () => {
      const el = createMockElement();
      const event = { target: el } as unknown as Event;
      expect(getEventPath(event)).toEqual([el]);
    });

    it('returns empty array when neither composedPath nor target is present', () => {
      const event = {} as Event;
      expect(getEventPath(event)).toEqual([]);
    });
  });

  describe('getEventTarget', () => {
    it('returns composedPath[0] when available', () => {
      const el1 = createMockElement();
      const el2 = createMockElement();
      const event = {
        composedPath: () => [el1, el2],
        target: el2,
      } as unknown as Event;

      expect(getEventTarget(event)).toBe(el1);
    });

    it('falls back to target when composedPath is empty', () => {
      const el = createMockElement();
      const event = {
        composedPath: () => [],
        target: el,
      } as unknown as Event;

      expect(getEventTarget(event)).toBe(el);
    });

    it('applies type guard filter when supplied and passes', () => {
      const el = createMockElement();
      const event = { target: el } as unknown as Event;

      const result = getEventTarget(event, isElementLike);
      expect(result).toBe(el);
    });

    it('returns null when guard rejects target', () => {
      const textNode = { nodeType: 3 } as unknown as EventTarget;
      const event = { target: textNode } as unknown as Event;

      const result = getEventTarget(event, isElementLike);
      expect(result).toBeNull();
    });

    it('returns null when no target or path is present', () => {
      const event = {} as Event;
      expect(getEventTarget(event)).toBeNull();
    });
  });

  describe('isPortalOrExcludedTarget', () => {
    it('returns true when element in path has data-popover-portal', () => {
      const portal = createMockElement({ [DATA_POPOVER_PORTAL]: 'true' });
      const button = createMockElement();

      const event = {
        composedPath: () => [button, portal],
      } as unknown as Event;

      expect(isPortalOrExcludedTarget(event)).toBe(true);
    });

    it('returns true when element in path has data-popover-ignore-outside', () => {
      const ignored = createMockElement({ [DATA_POPOVER_IGNORE_OUTSIDE]: '' });

      const event = {
        composedPath: () => [ignored],
      } as unknown as Event;

      expect(isPortalOrExcludedTarget(event)).toBe(true);
    });

    it('returns false when no element in path has portal or ignore attribute', () => {
      const normal = createMockElement();
      const event = {
        composedPath: () => [normal],
      } as unknown as Event;

      expect(isPortalOrExcludedTarget(event)).toBe(false);
    });
  });
});
