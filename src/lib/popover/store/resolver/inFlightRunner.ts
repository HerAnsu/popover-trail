/**
 * Identity-Guarded In-Flight Promise Execution Runner.
 *
 * @module store/resolver/inFlightRunner
 */

/**
 * Executes an async task while maintaining in-flight map registration with identity-guarded removal.
 * Prevents late-settling asynchronous operations from evicting newly initiated in-flight promises.
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
