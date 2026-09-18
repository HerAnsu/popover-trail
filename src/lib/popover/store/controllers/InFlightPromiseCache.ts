/**
 * InFlightPromiseCache for deduplicating asynchronous operations per key with bounded capacity.
 */
const DEFAULT_MAX_IN_FLIGHT = 100;

/**
 * In-flight promise cache for deduplicating concurrent asynchronous operations per key with bounded capacity.
 *
 * When multiple callers request the same key concurrently, only one asynchronous operation executes while all callers
 * share and await the identical promise. Upon resolution or rejection, completed operations are automatically removed.
 *
 * @template TData - Resolved data type returned by the promise.
 * @template TPopoverKey - Key identifying the asynchronous operation.
 *
 * @example
 * ```typescript
 * const cache = new InFlightPromiseCache<UserData, string>();
 *
 * // Only triggers a single network request; both callers await the same promise:
 * const p1 = cache.runTracked('user-1', () => fetchUser('user-1'));
 * const p2 = cache.runTracked('user-1', () => fetchUser('user-1'));
 * ```
 */
export class InFlightPromiseCache<TData = unknown, TPopoverKey extends string = string> {
  private readonly inFlight = new Map<TPopoverKey, Promise<TData>>();
  private readonly maxSize: number;

  /**
   * Initializes the in-flight promise cache with an upper capacity limit.
   *
   * @param maxSize - Maximum concurrent in-flight promises before evicting oldest (default: 100).
   */
  constructor(maxSize = DEFAULT_MAX_IN_FLIGHT) {
    this.maxSize = maxSize;
  }

  /**
   * Number of operations currently pending resolution.
   */
  public get size(): number {
    return this.inFlight.size;
  }

  /**
   * Underlying Map of currently active in-flight promises.
   */
  public get inFlightMap(): Map<TPopoverKey, Promise<TData>> {
    return this.inFlight;
  }

  /**
   * Checks if an operation with the given key is currently in-flight.
   *
   * @param key - Operation key.
   * @returns True if currently running, false otherwise.
   */
  public has(key: TPopoverKey): boolean {
    return this.inFlight.has(key);
  }

  /**
   * Retrieves the running promise for the given key, if one is active.
   *
   * @param key - Operation key.
   * @returns Active promise or `undefined`.
   */
  public get(key: TPopoverKey): Promise<TData> | undefined {
    return this.inFlight.get(key);
  }

  /**
   * Tracks an in-flight promise under the specified key, evicting the oldest key if capacity is exceeded.
   *
   * @param key - Operation key.
   * @param promise - Active Promise to track.
   */
  public set(key: TPopoverKey, promise: Promise<TData>): void {
    if (this.inFlight.size >= this.maxSize && !this.inFlight.has(key)) {
      const oldestKey = this.inFlight.keys().next().value;
      if (oldestKey !== undefined) this.inFlight.delete(oldestKey);
    }
    this.inFlight.set(key, promise);
  }

  /**
   * Removes an operation from tracking.
   *
   * @param key - Operation key.
   * @param promise - Optional promise reference to only remove if matching.
   */
  public remove(key: TPopoverKey, promise?: Promise<TData>): void {
    if (!promise || this.inFlight.get(key) === promise) {
      this.inFlight.delete(key);
    }
  }

  /**
   * Clears all in-flight promise references.
   */
  public clear(): void {
    this.inFlight.clear();
  }

  /**
   * Executes an async task or joins an already existing in-flight task under the given key.
   * Automatically cleans up the key from the cache once the promise settles.
   *
   * @param key - Deduplication key.
   * @param task - Factory returning the Promise to execute if not already running.
   * @returns Shared Promise resolving to task output.
   *
   * @example
   * ```typescript
   * const data = await cache.runTracked('fetch-details', () => api.getDetails());
   * ```
   */
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
