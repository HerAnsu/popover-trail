/**
 * Identity-Guarded In-Flight Promise Execution Runner.
 *
 * @module store/resolver/inFlightRunner
 */

/**
 * Executes an async task while maintaining in-flight map registration with identity-guarded removal.
 * Prevents late-settling asynchronous operations from evicting newly initiated in-flight promises.
 *
 * @template TData - Resolved data type returned by the promise.
 * @template TPopoverKey - Key identifying the asynchronous operation.
 * @param inFlightPromises - Map storing active in-flight promises.
 * @param key - Popover key under execution.
 * @param task - Async task factory function.
 * @returns Tracked Promise resolving to task output.
 *
 * @example
 * ```typescript
 * const promise = executeTrackedInFlight(inFlightMap, 'card-1', async () => {
 *   return await fetchData();
 * });
 * ```
 */
export function executeTrackedInFlight<TData, TPopoverKey extends string = string>(
  inFlightPromises: Map<TPopoverKey | string, Promise<TData>>,
  key: TPopoverKey | string,
  task: () => Promise<TData>,
): Promise<TData> {
  const promise = task().finally(() => {
    if (inFlightPromises.get(key) === promise) inFlightPromises.delete(key);
  });

  inFlightPromises.set(key, promise);
  return promise;
}
