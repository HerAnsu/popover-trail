import { describe, expect, it } from 'vitest';
import { CacheSequenceGuard } from './cacheSequenceGuard';

describe('CacheSequenceGuard', () => {
  it('should generate monotonic sequences and identify latest ticket', () => {
    const guard = new CacheSequenceGuard();
    const t1 = guard.next('item-1');
    const t2 = guard.next('item-1');

    expect(t1).toBe(1);
    expect(t2).toBe(2);

    expect(guard.isLatest('item-1', t1)).toBe(false);
    expect(guard.isLatest('item-1', t2)).toBe(true);
    expect(guard.size).toBe(1);
  });

  it('should track keys independently', () => {
    const guard = new CacheSequenceGuard();
    const a1 = guard.next('a');
    const b1 = guard.next('b');
    const a2 = guard.next('a');

    expect(guard.isLatest('b', b1)).toBe(true);
    expect(guard.isLatest('a', a1)).toBe(false);
    expect(guard.isLatest('a', a2)).toBe(true);
  });

  it('should handle deletion and clear', () => {
    const guard = new CacheSequenceGuard();
    guard.next('key-1');
    expect(guard.delete('key-1')).toBe(true);
    expect(guard.delete('key-1')).toBe(false);

    guard.next('k1');
    guard.next('k2');
    guard.clear();
    expect(guard.size).toBe(0);
  });

  it('should safely reject invalid keys', () => {
    const guard = new CacheSequenceGuard();
    expect(guard.next('__proto__')).toBe(0);
    expect(guard.isLatest('__proto__', 1)).toBe(false);
  });
});
