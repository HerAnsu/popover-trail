import { describe, it, expect } from 'vitest';
import { createHydrationManager } from './storeHydration';

describe('storeHydration module', () => {
  it('increments root counter and checks staleness correctly', () => {
    const manager = createHydrationManager();

    const c1 = manager.incrementRootCounter();
    expect(c1).toBe(1);
    expect(manager.isRootStale(c1)).toBe(false);

    const c2 = manager.incrementRootCounter();
    expect(c2).toBe(2);
    expect(manager.isRootStale(c1)).toBe(true);
  });

  it('increments nested parent counter and checks staleness', () => {
    const manager = createHydrationManager();

    const c1 = manager.incrementNestedCounter('parent-1');
    expect(c1).toBe(1);
    expect(manager.isNestedStale('parent-1', c1)).toBe(false);

    manager.incrementNestedCounter('parent-1');
    expect(manager.isNestedStale('parent-1', c1)).toBe(true);
  });

  it('resets hydration counters cleanly', () => {
    const manager = createHydrationManager();
    manager.incrementRootCounter();
    manager.incrementNestedCounter('p1');

    manager.resetHydrationCounters();

    expect(manager.getRootCounter()).toBe(0);
    expect(manager.getNestedCounters()).toEqual({});
  });

  it('returns true for isNestedStale when checking unmapped parent key', () => {
    const manager = createHydrationManager();
    expect(manager.isNestedStale('unmapped-parent', 1)).toBe(true);
  });

  it('deletes nested parent counter individually', () => {
    const manager = createHydrationManager();
    manager.incrementNestedCounter('p1');
    manager.incrementNestedCounter('p2');
    expect(manager.getNestedCounters()).toHaveProperty('p1');

    manager.deleteNestedCounter('p1');
    expect(manager.getNestedCounters()).not.toHaveProperty('p1');
    expect(manager.getNestedCounters()).toHaveProperty('p2');
  });

  it('tracks monotonic epoch and validates epoch staleness', () => {
    const manager = createHydrationManager();
    expect(manager.getEpoch()).toBe(0);

    const epoch1 = manager.getEpoch();
    expect(manager.isEpochStale(epoch1)).toBe(false);

    manager.incrementEpoch();
    expect(manager.getEpoch()).toBe(1);
    expect(manager.isEpochStale(epoch1)).toBe(true);

    manager.markAllCountersStale();
    expect(manager.getEpoch()).toBe(2);
  });
});
