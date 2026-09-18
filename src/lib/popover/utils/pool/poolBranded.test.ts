import { describe, it, expect } from 'vitest';
import {
  toPoolCapacity,
  toPoolSize,
  toPoolTimeoutMs,
  isPoolCapacity,
  isPoolSize,
  isPoolTimeoutMs,
  DEFAULT_POOL_INITIAL,
  DEFAULT_POOL_MAX,
  DEFAULT_LEAK_TIMEOUT,
} from './poolBranded';

describe('poolBranded', () => {
  it('converts and clamps valid PoolCapacity values', () => {
    expect(toPoolCapacity(10)).toBe(10);
    expect(toPoolCapacity(0)).toBe(1);
    expect(toPoolCapacity(-5)).toBe(1);
    expect(toPoolCapacity(Number.NaN)).toBe(1);
    expect(toPoolCapacity(12.7)).toBe(12);
  });

  it('converts and clamps valid PoolSize values', () => {
    expect(toPoolSize(5)).toBe(5);
    expect(toPoolSize(0)).toBe(0);
    expect(toPoolSize(-1)).toBe(0);
    expect(toPoolSize(Number.NaN)).toBe(0);
    expect(toPoolSize(8.9)).toBe(8);
  });

  it('converts and clamps valid PoolTimeoutMs values', () => {
    expect(toPoolTimeoutMs(5000)).toBe(5000);
    expect(toPoolTimeoutMs(0)).toBe(0);
    expect(toPoolTimeoutMs(-100)).toBe(0);
    expect(toPoolTimeoutMs(Number.NaN)).toBe(0);
  });

  it('validates predicates correctly', () => {
    expect(isPoolCapacity(1)).toBe(true);
    expect(isPoolCapacity(100)).toBe(true);
    expect(isPoolCapacity(0)).toBe(false);
    expect(isPoolCapacity(-1)).toBe(false);
    expect(isPoolCapacity(1.5)).toBe(false);
    expect(isPoolCapacity('10')).toBe(false);

    expect(isPoolSize(0)).toBe(true);
    expect(isPoolSize(50)).toBe(true);
    expect(isPoolSize(-1)).toBe(false);

    expect(isPoolTimeoutMs(0)).toBe(true);
    expect(isPoolTimeoutMs(1000)).toBe(true);
    expect(isPoolTimeoutMs(-10)).toBe(false);
  });

  it('provides safe standard defaults', () => {
    expect(DEFAULT_POOL_INITIAL).toBe(32);
    expect(DEFAULT_POOL_MAX).toBe(256);
    expect(DEFAULT_LEAK_TIMEOUT).toBe(10000);
  });
});
