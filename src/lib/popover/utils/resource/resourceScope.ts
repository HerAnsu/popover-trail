/**
 * Functional Scoped Resource Lifecycle Runners.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/resource/resourceScope
 */

import {
  getDisposeMethod,
  getAsyncDisposeMethod,
  type ScopeDisposable,
  type AsyncScopeDisposable,
} from './disposableTypes';
import { isDisposable } from './disposableGuards';
import { Err, type Result } from '../result';
import { toError } from '../guards/errorGuards';

function disposeResource(r: ScopeDisposable): void {
  try {
    const fn = getDisposeMethod(r);
    fn?.();
  } catch {
    /* isolated */
  }
}

async function disposeResourceAsync(r: AsyncScopeDisposable | ScopeDisposable): Promise<void> {
  try {
    const asyncFn = getAsyncDisposeMethod(r);
    if (asyncFn) {
      await asyncFn();
    } else if (isDisposable(r)) {
      disposeResource(r);
    }
  } catch {
    /* isolated */
  }
}

export function using<TResource extends ScopeDisposable, TReturn>(
  resource: TResource,
  fn: (res: TResource) => TReturn,
): TReturn {
  try {
    return fn(resource);
  } finally {
    disposeResource(resource);
  }
}

export async function usingAsync<TResource extends AsyncScopeDisposable | ScopeDisposable, TReturn>(
  resource: TResource,
  fn: (res: TResource) => Promise<TReturn>,
): Promise<TReturn> {
  try {
    return await fn(resource);
  } finally {
    await disposeResourceAsync(resource);
  }
}

/**
 * Executes a callback with a disposable resource and guarantees cleanup in a `finally` block.
 * Returns the callback's `Result`, or catches any thrown exception into `Err`.
 *
 * @template TResource - Disposable resource (`[Symbol.dispose]` or `.dispose()`).
 * @template TReturn - Value payload type.
 * @template E - Error type.
 * @param resource - Resource to manage.
 * @param fn - Callback receiving the resource.
 * @param onError - Optional function to map unknown caught errors to type `E`.
 * @returns Result containing the computed Ok data, or captured Err.
 *
 * @example
 * ```typescript
 * const result = usingResult(createHistoryManager(30), (history) => {
 *   history.pushSnapshot(state);
 *   return history.undoResult(nextState);
 * });
 * // history is guaranteed to be disposed here
 * ```
 */
export function usingResult<TResource extends ScopeDisposable, TReturn, E>(
  resource: TResource,
  fn: (res: TResource) => Result<TReturn, E>,
  onError: (err: unknown) => E,
): Result<TReturn, E>;
export function usingResult<TResource extends ScopeDisposable, TReturn, E = Error>(
  resource: TResource,
  fn: (res: TResource) => Result<TReturn, E>,
): Result<TReturn, E | Error>;
export function usingResult<TResource extends ScopeDisposable, TReturn, E>(
  resource: TResource,
  fn: (res: TResource) => Result<TReturn, E>,
  onError?: (err: unknown) => E,
): Result<TReturn, E | Error> {
  try {
    return fn(resource);
  } catch (err) {
    return Err(onError ? onError(err) : toError(err));
  } finally {
    disposeResource(resource);
  }
}

/**
 * Asynchronously runs a callback with a disposable resource and cleans it up in a finally block.
 *
 * @remarks
 * Asynchronous counterpart of `usingResult`. Awaits `fn(resource)` and guarantees execution of
 * `[Symbol.asyncDispose]` or `disposeResourceAsync` in a `finally` block before resolving.
 * Catches asynchronous rejections or thrown errors into `Err Result`.
 *
 * @template TResource - Async or sync disposable resource.
 * @template TReturn - Resolved value type.
 * @template E - Error model type.
 * @param resource - Async disposable resource to manage.
 * @param fn - Asynchronous computation callback.
 * @param onError - Optional transformer converting unknown errors into domain error `E`.
 * @returns Promise resolving to Ok Result or Err Result.
 *
 * @example
 * ```typescript
 * const res = await usingAsyncResult(createChannel('sync-tab'), async (channel) => {
 *   await channel.broadcast(envelope);
 *   return ok(true);
 * });
 * ```
 */
export function usingAsyncResult<
  TResource extends AsyncScopeDisposable | ScopeDisposable,
  TReturn,
  E,
>(
  resource: TResource,
  fn: (res: TResource) => Promise<Result<TReturn, E>>,
  onError: (err: unknown) => E,
): Promise<Result<TReturn, E>>;
export function usingAsyncResult<
  TResource extends AsyncScopeDisposable | ScopeDisposable,
  TReturn,
  E = Error,
>(
  resource: TResource,
  fn: (res: TResource) => Promise<Result<TReturn, E>>,
): Promise<Result<TReturn, E | Error>>;
export async function usingAsyncResult<
  TResource extends AsyncScopeDisposable | ScopeDisposable,
  TReturn,
  E,
>(
  resource: TResource,
  fn: (res: TResource) => Promise<Result<TReturn, E>>,
  onError?: (err: unknown) => E,
): Promise<Result<TReturn, E | Error>> {
  try {
    return await fn(resource);
  } catch (err) {
    return Err(onError ? onError(err) : toError(err));
  } finally {
    await disposeResourceAsync(resource);
  }
}
