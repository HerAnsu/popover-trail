import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  acquireScrollLock,
  releaseScrollLock,
  useBodyScrollLock,
} from './useBodyScrollLock';

describe('useBodyScrollLock', () => {
  it('exports useBodyScrollLock hook and lock functions', () => {
    expect(typeof useBodyScrollLock).toBe('function');
    expect(typeof acquireScrollLock).toBe('function');
    expect(typeof releaseScrollLock).toBe('function');
  });

  describe('acquireScrollLock and releaseScrollLock', () => {
    const origDoc = globalThis.document;
    const origWin = globalThis.window;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      globalThis.document = origDoc;
      globalThis.window = origWin;
    });

    it('does nothing in non-DOM environment', () => {
      // @ts-expect-error test undefined document
      globalThis.document = undefined;
      expect(() => acquireScrollLock()).not.toThrow();
      expect(() => releaseScrollLock()).not.toThrow();
    });

    it('locks body scrolling and restores it when released', () => {
      const mockBody = {
        style: {
          overflow: 'auto',
          paddingRight: '',
        },
      };
      const mockDoc = {
        body: mockBody,
        documentElement: { clientWidth: 1000 },
      };
      const mockWin = {
        innerWidth: 1015,
      };

      globalThis.document = mockDoc as unknown as Document;
      globalThis.window = mockWin as unknown as Window & typeof globalThis;

      acquireScrollLock();
      expect(mockBody.style.overflow).toBe('hidden');
      expect(mockBody.style.paddingRight).toBe('15px');

      // Nested lock request
      acquireScrollLock();
      expect(mockBody.style.overflow).toBe('hidden');

      // First release
      releaseScrollLock();
      expect(mockBody.style.overflow).toBe('hidden');

      // Final release restores original values
      releaseScrollLock();
      expect(mockBody.style.overflow).toBe('auto');
      expect(mockBody.style.paddingRight).toBe('');
    });
  });
});
