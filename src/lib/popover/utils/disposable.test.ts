import { describe, it, expect, vi } from 'vitest';
import { createDisposable, CompositeDisposable } from './disposable';

describe('disposable utility', () => {
  it('calls cleanupFn when dispose() is invoked', () => {
    const cleanup = vi.fn();
    const disposable = createDisposable(cleanup);

    disposable.dispose();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('ensures cleanup is idempotent (called only once)', () => {
    const cleanup = vi.fn();
    const disposable = createDisposable(cleanup);

    disposable.dispose();
    disposable.dispose();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('safely suppresses errors thrown by cleanupFn during disposal', () => {
    const cleanup = () => {
      throw new Error('Cleanup error');
    };
    const disposable = createDisposable(cleanup);

    expect(() => disposable.dispose()).not.toThrow();
  });

  it('attaches Symbol.dispose if defined on global Symbol object', () => {
    const cleanup = vi.fn();
    const disposable = createDisposable(cleanup);

    const disposeSymbol = Symbol.dispose;
    if (disposeSymbol) {
      expect((disposable as Record<symbol, unknown>)[disposeSymbol]).toBeDefined();
    }
  });

  it('manages multiple disposables atomically with CompositeDisposable', () => {
    const c1 = vi.fn();
    const c2 = vi.fn();
    const composite = new CompositeDisposable();

    composite.add(createDisposable(c1), c2);
    expect(composite.size).toBe(2);

    composite.dispose();
    expect(c1).toHaveBeenCalledTimes(1);
    expect(c2).toHaveBeenCalledTimes(1);
    expect(composite.size).toBe(0);

    // Adding after dispose immediately executes
    const c3 = vi.fn();
    composite.add(c3);
    expect(c3).toHaveBeenCalledTimes(1);

    const c4 = vi.fn();
    const d4 = createDisposable(c4);
    const comp2 = new CompositeDisposable();
    comp2.add(d4);
    expect(comp2.size).toBe(1);
    comp2.remove(d4);
    expect(comp2.size).toBe(0);
  });
});
