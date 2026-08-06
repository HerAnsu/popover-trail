import { describe, it, expect, vi } from 'vitest';
import { createDisposable } from './disposable';

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

    const disposeSymbol = (Symbol as unknown as { dispose?: symbol }).dispose;
    if (disposeSymbol) {
      expect(disposable[disposeSymbol]).toBeDefined();
    }
  });
});
