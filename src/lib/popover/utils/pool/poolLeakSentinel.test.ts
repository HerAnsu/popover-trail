import { describe, it, expect } from 'vitest';
import { PoolLeakSentinel } from './poolLeakSentinel';

describe('PoolLeakSentinel', () => {
  it('acts as a zero-overhead no-op when disabled', () => {
    const sentinel = new PoolLeakSentinel<{ id: string }>(false);
    const item = { id: 'obj-1' };

    sentinel.onAcquire(item);
    expect(sentinel.inFlightCount).toBe(0);

    sentinel.onRelease(item);
    expect(sentinel.inFlightCount).toBe(0);

    const leaks = sentinel.getLeakedItems(10, Date.now() + 100000);
    expect(leaks.size).toBe(0);
  });

  it('records allocation stack trace and tracks in-flight count when enabled', () => {
    const sentinel = new PoolLeakSentinel<{ id: string }>(true, 5000);
    const itemA = { id: 'a' };
    const itemB = { id: 'b' };

    sentinel.onAcquire(itemA);
    sentinel.onAcquire(itemB);
    expect(sentinel.inFlightCount).toBe(2);

    sentinel.onRelease(itemA);
    expect(sentinel.inFlightCount).toBe(1);

    // Releasing already released item is safe
    sentinel.onRelease(itemA);
    expect(sentinel.inFlightCount).toBe(1);
  });

  it('detects unreturned leaked items exceeding the threshold timeout', () => {
    const sentinel = new PoolLeakSentinel<{ id: string }>(true, 5000);
    const item = { id: 'leaked-node' };
    const baseTime = Date.now();
    sentinel.onAcquire(item);

    // After 4000ms: not yet leaked
    const earlyCheck = sentinel.getLeakedItems(5000, baseTime + 4000);
    expect(earlyCheck.size).toBe(0);

    // After 6000ms: threshold exceeded, detected as leak
    const leakCheck = sentinel.getLeakedItems(5000, baseTime + 6000);
    expect(leakCheck.size).toBe(1);
    expect(leakCheck.has(item)).toBe(true);

    const info = leakCheck.get(item);
    expect(info?.stack).toBeDefined();
    expect(typeof info?.acquiredAt).toBe('number');
  });

  it('clears all tracked items on clear()', () => {
    const sentinel = new PoolLeakSentinel<{ val: number }>(true);
    sentinel.onAcquire({ val: 1 });
    sentinel.onAcquire({ val: 2 });
    expect(sentinel.inFlightCount).toBe(2);

    sentinel.clear();
    expect(sentinel.inFlightCount).toBe(0);
    expect(sentinel.getLeakedItems(0).size).toBe(0);
  });
});
