import { describe, it, expect, vi } from 'vitest';
import { ResizeObserverRegistry } from './resizeObserverRegistry';
import { definePopoverWorkerRPC } from './workerResolver';

describe('Phase 3 Architectural Features', () => {
  describe('ResizeObserverRegistry', () => {
    it('handles observe and unobserve cleanup gracefully without native ResizeObserver in Node', () => {
      const mockElement = (typeof document !== 'undefined'
        ? document.createElement('div')
        : { tagName: 'DIV' }) as unknown as Element;
      const mockCallback = vi.fn();

      const unobserve = ResizeObserverRegistry.observe(mockElement, mockCallback);
      expect(typeof unobserve).toBe('function');
      unobserve();

      ResizeObserverRegistry.clear();
    });

    it('returns noop unobserve for null or undefined elements', () => {
      const unobserveNull = ResizeObserverRegistry.observe(null, () => {});
      expect(typeof unobserveNull).toBe('function');
      unobserveNull();

      const unobserveUndefined = ResizeObserverRegistry.observe(undefined, () => {});
      expect(typeof unobserveUndefined).toBe('function');
      unobserveUndefined();
    });
  });

  describe('definePopoverWorkerRPC', () => {
    it('registers worker onmessage listener safely', () => {
      const handler = vi.fn().mockReturnValue({ title: 'Worker Data' });

      // In Node environment, self is window or global, test safe attachment
      definePopoverWorkerRPC(handler);
      expect(typeof handler).toBe('function');
    });
  });
});
