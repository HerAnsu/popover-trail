import { describe, it, expect, vi } from 'vitest';
import { PopoverMiddlewareEngine, composeMiddlewares } from './storeMiddlewareEngine';
import type { PopoverStore, PopoverMiddleware } from '../../types';

describe('PopoverMiddlewareEngine & composeMiddlewares', () => {
  it('registers and removes middlewares via use() return disposer', () => {
    const engine = new PopoverMiddlewareEngine();
    const mw = vi.fn();
    const unregister = engine.use(mw);

    expect(engine.size).toBe(1);
    unregister();
    expect(engine.size).toBe(0);
  });

  it('applies sequential middlewares merging patches', () => {
    const engine = new PopoverMiddlewareEngine();
    const mw1: PopoverMiddleware = () => ({ targetKey: 'k1' });
    const mw2: PopoverMiddleware = () => ({ baseZIndex: 2000 });

    engine.use(mw1);
    engine.use(mw2);

    const result = engine.apply({}, {} as PopoverStore);
    expect(result).toEqual({ targetKey: 'k1', baseZIndex: 2000 });
  });

  it('short-circuits pipeline if any middleware returns false', () => {
    const engine = new PopoverMiddlewareEngine();
    const mw1: PopoverMiddleware = () => false;
    const mw2 = vi.fn();

    engine.use(mw1);
    engine.use(mw2);

    const result = engine.apply({}, {} as PopoverStore);
    expect(result).toBe(false);
    expect(mw2).not.toHaveBeenCalled();
  });

  it('composeMiddlewares chains multiple middleware into a single function', () => {
    const mw1: PopoverMiddleware = (patch) => ({ ...patch, targetKey: 'composed' });
    const mw2: PopoverMiddleware = (patch) => ({ ...patch, baseZIndex: 5000 });

    const composed = composeMiddlewares(mw1, mw2);
    const result = composed({}, {} as PopoverStore);

    expect(result).toEqual({ targetKey: 'composed', baseZIndex: 5000 });
  });

  it('composeMiddlewares short-circuits when false is returned', () => {
    const mw1: PopoverMiddleware = () => false;
    const mw2 = vi.fn();

    const composed = composeMiddlewares(mw1, mw2);
    const result = composed({}, {} as PopoverStore);

    expect(result).toBe(false);
    expect(mw2).not.toHaveBeenCalled();
  });
});
