import { describe, it, expect, vi } from 'vitest';
import { AsyncCompositeDisposable } from './asyncCompositeDisposable';
import { ASYNC_DISPOSE_SYMBOL } from './disposableTypes';

describe('AsyncCompositeDisposable', () => {
  it('disposes resources in strict LIFO reverse order', async () => {
    const order: number[] = [];
    const container = new AsyncCompositeDisposable();
    expect(container.isDisposed).toBe(false);

    container.add(
      async () => { order.push(1); },
      () => { order.push(2); },
      { disposeAsync: async () => { order.push(3); } },
    );
    expect(container.size).toBe(3);

    await container.disposeAsync();
    expect(container.isDisposed).toBe(true);
    expect(order).toEqual([3, 2, 1]);
    expect(container.size).toBe(0);
  });

  it('ensures async disposal is idempotent', async () => {
    const fn = vi.fn();
    const container = new AsyncCompositeDisposable();
    container.add(fn);

    await container.disposeAsync();
    await container.disposeAsync();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('isolates errors during async cleanup without halting others', async () => {
    const order: number[] = [];
    const container = new AsyncCompositeDisposable();
    container.add(
      async () => { order.push(1); },
      async () => { throw new Error('Boom'); },
      async () => { order.push(3); },
    );

    await expect(container.disposeAsync()).resolves.not.toThrow();
    expect(order).toEqual([3, 1]);
  });

  it('immediately cleans up items added after container is disposed', async () => {
    const container = new AsyncCompositeDisposable();
    await container.disposeAsync();

    const lateFn = vi.fn();
    container.add(lateFn);
    expect(lateFn).toHaveBeenCalledTimes(1);
  });

  it('supports Symbol.asyncDispose invocation', async () => {
    const fn = vi.fn();
    const container = new AsyncCompositeDisposable();
    container.add(fn);
    const disposeFn = container[ASYNC_DISPOSE_SYMBOL];
    if (disposeFn) {
      await disposeFn.call(container);
    }
    expect(fn).toHaveBeenCalledTimes(1);
    expect(container.isDisposed).toBe(true);
  });
});
