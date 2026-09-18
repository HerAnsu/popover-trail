import { describe, it, expect } from 'vitest';
import { AbortRegistry } from './AbortRegistry';

describe('AbortRegistry', () => {
  it('registers and manages controllers', () => {
    const registry = new AbortRegistry();
    const ctrl1 = registry.register('card-1');

    expect(registry.size).toBe(1);
    expect(ctrl1.signal.aborted).toBe(false);

    const ctrl2 = registry.register('card-1');
    expect(ctrl1.signal.aborted).toBe(true);
    expect(ctrl2.signal.aborted).toBe(false);

    registry.abortKey('card-1');
    expect(ctrl2.signal.aborted).toBe(true);
    expect(registry.size).toBe(0);
  });

  it('aborts all on dispose', () => {
    const registry = new AbortRegistry();
    const ctrl1 = registry.register('card-1');
    const ctrl2 = registry.register('card-2');

    registry[Symbol.dispose]();

    expect(ctrl1.signal.aborted).toBe(true);
    expect(ctrl2.signal.aborted).toBe(true);
    expect(registry.size).toBe(0);
  });
});
