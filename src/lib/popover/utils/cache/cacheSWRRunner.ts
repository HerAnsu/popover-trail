/**
 * SWR asynchronous runner with in-flight deduplication and exponential retry.
 *
 * @module cache/cacheSWRRunner
 */

export class CacheSWRRunner<T = unknown> {
  public readonly capacity: number;
  private readonly inFlight = new Map<string, Promise<T>>();

  constructor(capacity = 100) {
    this.capacity = capacity;
  }

  public async runDeduplicated(key: string, task: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    if (this.inFlight.size >= this.capacity) {
      const oldest = this.inFlight.keys().next().value;
      if (oldest !== undefined) this.inFlight.delete(oldest);
    }

    const promise = task().finally(() => {
      if (this.inFlight.get(key) === promise) {
        this.inFlight.delete(key);
      }
    });

    this.inFlight.set(key, promise);
    return promise;
  }

  public async runWithRetry(
    task: () => Promise<T>,
    retries = 2,
    baseDelayMs = 200,
    attempt = 1,
  ): Promise<T> {
    try {
      return await task();
    } catch (err) {
      if (attempt > retries) throw err;
      const jitter = (attempt * 17) % 50;
      const delay = Math.min(2000, baseDelayMs * Math.pow(2, attempt - 1)) + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.runWithRetry(task, retries, baseDelayMs, attempt + 1);
    }
  }

  public isInFlight(key: string): boolean {
    return this.inFlight.has(key);
  }

  public clear(): void {
    this.inFlight.clear();
  }
}
