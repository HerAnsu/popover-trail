/**
 * InFlightPromiseCache for deduplicating asynchronous operations per key with bounded capacity.
 */
const DEFAULT_MAX_IN_FLIGHT = 100;

export class InFlightPromiseCache<TData = unknown, TPopoverKey extends string = string> {
  private readonly inFlight = new Map<TPopoverKey, Promise<TData>>();
  private readonly maxSize: number;

  constructor(maxSize = DEFAULT_MAX_IN_FLIGHT) {
    this.maxSize = maxSize;
  }

  public get size(): number {
    return this.inFlight.size;
  }

  public get inFlightMap(): Map<TPopoverKey, Promise<TData>> {
    return this.inFlight;
  }

  public has(key: TPopoverKey): boolean {
    return this.inFlight.has(key);
  }

  public get(key: TPopoverKey): Promise<TData> | undefined {
    return this.inFlight.get(key);
  }

  public set(key: TPopoverKey, promise: Promise<TData>): void {
    if (this.inFlight.size >= this.maxSize && !this.inFlight.has(key)) {
      const oldestKey = this.inFlight.keys().next().value;
      if (oldestKey !== undefined) this.inFlight.delete(oldestKey);
    }
    this.inFlight.set(key, promise);
  }

  public remove(key: TPopoverKey, promise?: Promise<TData>): void {
    if (!promise || this.inFlight.get(key) === promise) {
      this.inFlight.delete(key);
    }
  }

  public clear(): void {
    this.inFlight.clear();
  }

  public async runTracked(key: TPopoverKey, task: () => Promise<TData>): Promise<TData> {
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const promise = task().finally(() => {
      if (this.inFlight.get(key) === promise) {
        this.inFlight.delete(key);
      }
    });

    this.set(key, promise);
    return promise;
  }

  public [Symbol.dispose](): void {
    this.clear();
  }
}
