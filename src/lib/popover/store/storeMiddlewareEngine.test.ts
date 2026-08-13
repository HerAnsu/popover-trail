import { describe, it, expect, vi } from 'vitest';
import { PopoverMiddlewareEngine } from './storeMiddlewareEngine';
import { PopoverStore } from '../types';

describe('storeMiddlewareEngine module', () => {
  it('registers and unsubscribes middleware handlers', () => {
    const engine = new PopoverMiddlewareEngine();
    const mw = vi.fn();

    const unsub = engine.use(mw);
    expect(engine.size).toBe(1);

    unsub();
    expect(engine.size).toBe(0);
  });

  it('runs middleware pipeline and transforms state patches', () => {
    const engine = new PopoverMiddlewareEngine();
    engine.use((patch) => {
      if (patch.debug !== undefined) {
        return { debug: true };
      }
    });

    const initialPatch = { debug: false };
    const mockStore = {} as PopoverStore;
    const result = engine.apply(initialPatch, mockStore);

    expect(result).toEqual({ debug: true });
  });

  it('cancels state update if middleware returns false', () => {
    const engine = new PopoverMiddlewareEngine();
    engine.use(() => false);

    const result = engine.apply({ debug: true }, {} as PopoverStore);
    expect(result).toBe(false);
  });

  it('handles exceptions in middleware safely without breaking pipeline', () => {
    const engine = new PopoverMiddlewareEngine();
    engine.use(() => {
      throw new Error('MW error');
    });

    const patch = { debug: true };
    const result = engine.apply(patch, {} as PopoverStore);
    expect(result).toEqual({ debug: true });
  });

  it('runs multiple middlewares in order and stops chain if one returns false', () => {
    const engine = new PopoverMiddlewareEngine();
    const order: number[] = [];

    engine.use(() => {
      order.push(1);
    });
    engine.use(() => {
      order.push(2);
      return false; // Cancel update
    });
    engine.use(() => {
      order.push(3);
    });

    const result = engine.apply({ debug: true }, {} as PopoverStore);
    expect(result).toBe(false);
    expect(order).toEqual([1, 2]); // Third middleware was never called
  });

  it('unsubscribes all registered middlewares via unsubscribe callbacks', () => {
    const engine = new PopoverMiddlewareEngine();
    const unsub1 = engine.use(() => {});
    const unsub2 = engine.use(() => {});
    expect(engine.size).toBe(2);

    unsub1();
    unsub2();
    expect(engine.size).toBe(0);
  });

  it('returns initial patch without copying when no middlewares are registered', () => {
    const engine = new PopoverMiddlewareEngine();
    const patch = { ownerId: 'owner-1' };
    expect(engine.apply(patch, {} as PopoverStore)).toBe(patch);
  });

  it('ignores non-object return values from middleware without crashing', () => {
    const engine = new PopoverMiddlewareEngine();
    // @ts-expect-error Returning string literal
    engine.use(() => 'invalid_patch');
    const result = engine.apply({ ownerId: 'owner-1' }, {} as PopoverStore);
    expect(result).toEqual({ ownerId: 'owner-1' });
  });

  it('safely handles falsy registrations and supports clear/dispose', () => {
    const engine = new PopoverMiddlewareEngine();
    // @ts-expect-error Testing invalid middleware input
    const unsub = engine.use(null);
    expect(engine.size).toBe(0);
    expect(() => unsub()).not.toThrow();

    engine.use(() => ({}));
    expect(engine.size).toBe(1);
    engine.clear();
    expect(engine.size).toBe(0);

    engine.use(() => ({}));
    engine.dispose();
    expect(engine.size).toBe(0);
  });
});
