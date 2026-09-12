/**
 * Dynamic memory and payload weight tracker for cache budgeting.
 *
 * @module cache/cacheWeightTracker
 */

export class CacheWeightTracker {
  public readonly capacity: number;
  private totalWeight = 0;
  private readonly maxWeight: number;

  constructor(maxWeight = Infinity, capacity = 1000) {
    this.maxWeight = Number.isFinite(maxWeight) && maxWeight > 0 ? maxWeight : Infinity;
    this.capacity = capacity;
  }

  public get weight(): number {
    return this.totalWeight;
  }

  public add(weight = 1): void {
    this.totalWeight += Math.max(0, weight);
  }

  public remove(weight = 1): void {
    this.totalWeight = Math.max(0, this.totalWeight - Math.max(0, weight));
  }

  public isOverBudget(): boolean {
    return this.totalWeight > this.maxWeight;
  }

  public reset(): void {
    this.totalWeight = 0;
  }
}
