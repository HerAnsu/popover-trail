import { describe, it, expect } from 'vitest';
import { CacheWeightTracker } from './cacheWeightTracker';

describe('Cache Weight Tracker', () => {
  it('tracks weight accumulation and detects over-budget states', () => {
    const tracker = new CacheWeightTracker(100);
    expect(tracker.weight).toBe(0);
    expect(tracker.isOverBudget()).toBe(false);

    tracker.add(50);
    expect(tracker.weight).toBe(50);
    expect(tracker.isOverBudget()).toBe(false);

    tracker.add(60);
    expect(tracker.weight).toBe(110);
    expect(tracker.isOverBudget()).toBe(true);

    tracker.remove(30);
    expect(tracker.weight).toBe(80);
    expect(tracker.isOverBudget()).toBe(false);

    tracker.reset();
    expect(tracker.weight).toBe(0);
  });
});
