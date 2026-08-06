import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ResizeObserverRegistry } from './resizeObserverRegistry';

describe('resizeObserverRegistry utility', () => {
  let mockObserve: ReturnType<typeof vi.fn>;
  let mockUnobserve: ReturnType<typeof vi.fn>;
  let mockDisconnect: ReturnType<typeof vi.fn>;
  let observerCallback: (entries: ResizeObserverEntry[]) => void;

  class MockResizeObserver {
    constructor(cb: (entries: ResizeObserverEntry[]) => void) {
      observerCallback = cb;
    }
    observe = mockObserve;
    unobserve = mockUnobserve;
    disconnect = mockDisconnect;
  }

  const originalResizeObserver = globalThis.ResizeObserver;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    mockObserve = vi.fn();
    mockUnobserve = vi.fn();
    mockDisconnect = vi.fn();
    // @ts-expect-error - mock ResizeObserver and window
    globalThis.ResizeObserver = MockResizeObserver;
    // @ts-expect-error - mock window
    globalThis.window = globalThis;
    ResizeObserverRegistry.clear();
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    globalThis.window = originalWindow;
  });

  it('returns noop cleanup when observing null element', () => {
    const unobserve = ResizeObserverRegistry.observe(null, () => {});
    expect(typeof unobserve).toBe('function');
    expect(() => unobserve()).not.toThrow();
  });

  it('registers observation on DOM element and invokes callback on resize', () => {
    const el = {} as Element;
    const callback = vi.fn();

    const unobserve = ResizeObserverRegistry.observe(el, callback);
    expect(mockObserve).toHaveBeenCalledWith(el);

    // Simulate resize event
    const mockEntry = { target: el } as unknown as ResizeObserverEntry;
    observerCallback([mockEntry]);

    expect(callback).toHaveBeenCalledWith(mockEntry);

    unobserve();
    expect(mockUnobserve).toHaveBeenCalledWith(el);
  });

  it('handles callback exception without crashing observer loop', () => {
    const el = {} as Element;
    const failingCallback = vi.fn(() => {
      throw new Error('Resize handler error');
    });

    ResizeObserverRegistry.observe(el, failingCallback);
    const mockEntry = { target: el } as unknown as ResizeObserverEntry;

    expect(() => observerCallback([mockEntry])).not.toThrow();
  });

  it('notifies multiple listeners attached to the same element', () => {
    const el = {} as Element;
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    const cleanup1 = ResizeObserverRegistry.observe(el, cb1);
    const cleanup2 = ResizeObserverRegistry.observe(el, cb2);

    const mockEntry = { target: el } as unknown as ResizeObserverEntry;
    observerCallback([mockEntry]);

    expect(cb1).toHaveBeenCalledWith(mockEntry);
    expect(cb2).toHaveBeenCalledWith(mockEntry);

    cleanup1();
    cleanup2();
  });

  it('gracefully handles missing ResizeObserver in SSR environments', () => {
    Reflect.deleteProperty(globalThis, 'ResizeObserver');

    const el = {} as Element;
    const cleanup = ResizeObserverRegistry.observe(el, () => {});

    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });
});
