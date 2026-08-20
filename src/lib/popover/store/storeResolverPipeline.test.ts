import { describe, it, expect, vi } from 'vitest';
import { invokeResolverSafely } from './storeResolverPipeline';

describe('storeResolverPipeline module', () => {
  it('invokes synchronous resolver function safely', () => {
    const resolver = (key: string) => ({ id: key });
    const controller = new AbortController();

    const res = invokeResolverSafely(resolver, 'card-1', null, undefined, controller.signal);
    expect(res).toEqual({ id: 'card-1' });
  });

  it('invokes async promise resolver function safely', async () => {
    const resolver = async (key: string) => `data-${key}`;
    const controller = new AbortController();

    const res = await invokeResolverSafely(resolver, 'card-2', null, undefined, controller.signal);
    expect(res).toBe('data-card-2');
  });

  it('handles object parameter fallback signature when first positional call fails with TypeError', () => {
    const resolver = (args: unknown) => {
      if (typeof args !== 'object' || args === null) {
        throw new TypeError('Expected object argument');
      }
      const obj = args as { key: string };
      return `fallback-${obj.key}`;
    };
    const controller = new AbortController();

    const res = invokeResolverSafely(resolver, 'card-3', null, undefined, controller.signal);
    expect(res).toBe('fallback-card-3');
  });

  it('does NOT re-execute resolver if a genuine business Error is thrown in positional call', () => {
    let callCount = 0;
    const failingResolver = vi.fn((_key: string) => {
      callCount++;
      throw new Error('User 404 Not Found');
    });

    const controller = new AbortController();

    expect(() =>
      invokeResolverSafely(failingResolver, 'user-404', null, undefined, controller.signal),
    ).toThrow('User 404 Not Found');

    // Guaranteed called exactly once, no blind retry
    expect(callCount).toBe(1);
  });

  it('passes AbortSignal to resolver function properly', async () => {
    let capturedSignal: AbortSignal | undefined;

    const resolver = (_key: string, _pd?: unknown, _ctx?: unknown, signal?: AbortSignal) => {
      capturedSignal = signal;
      return 'ok';
    };

    const controller = new AbortController();
    invokeResolverSafely(resolver, 'card-4', null, undefined, controller.signal);

    expect(capturedSignal).toBeDefined();
    expect(capturedSignal?.aborted).toBe(false);
    controller.abort();
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('throws structured PopoverError if resolver is not a function', () => {
    const controller = new AbortController();
    // @ts-expect-error Testing invalid resolver type
    expect(() => invokeResolverSafely(null, 'k', null, undefined, controller.signal)).toThrow(
      /resolver must be a function/,
    );
  });
});
