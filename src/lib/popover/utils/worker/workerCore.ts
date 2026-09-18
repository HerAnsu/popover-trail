/**
 * Core Web Worker Resolver Factory and Lifecycle Manager.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module utils/worker/workerCore
 */

import type { PopoverResolver } from '../../types';
import type { MaybePromise } from '../../types/utilityTypes';
import { wrapResult, isOk } from '../result';
import { DISPOSE_SYMBOL } from '../disposable';
import { createPopoverWorkerScript } from './workerScript';
import { executeWorkerTask } from './workerTask';
import type {
  WorkerResolver,
  WorkerResolverOptions,
  WorkerResolverDisposables,
} from './workerTypes';

type WorkerTarget<TData, TContext> =
  | Worker
  | string
  | ((key: string, parentData?: unknown, context?: TContext) => MaybePromise<TData>);

/**
 * Creates a background Web Worker data resolver with RPC message passing, timeout handling,
 * and automatic worker restart upon error.
 *
 * Can accept a pre-instantiated Worker instance, a script URL string, or an inline resolver function
 * that gets compiled into a transient Blob URL worker automatically.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Optional context type passed to the resolver.
 * @param workerOrFn - Worker instance, worker script URL, or resolver function.
 * @param options - Configuration options (timeout, autoRestart, fallbacks).
 * @returns An executable PopoverResolver augmented with resource disposal handles.
 *
 * @example
 * ```typescript
 * const resolver = createWorkerResolver(async (key) => {
 *   const res = await fetch(`/api/popovers/${key}`);
 *   return await res.json();
 * }, { timeoutMs: 5000 });
 *
 * const data = await resolver('profile-data');
 * // Later when disposing:
 * resolver.terminate();
 * ```
 */
export function createWorkerResolver<TData = unknown, TContext = unknown>(
  workerOrFn: WorkerTarget<TData, TContext>,
  options: WorkerResolverOptions<TData> = {},
): WorkerResolver<TData, TContext> {

  let worker: Worker | null = null;
  let scriptUrl: string | null = null;
  let reqId = 0;

  const initWorker = (): Worker | null => {
    if (typeof Worker === 'undefined') return null;
    if (workerOrFn instanceof Worker) return workerOrFn;
    if (typeof workerOrFn === 'string') {
      const res = wrapResult(() => new Worker(workerOrFn, { type: 'module' }));
      return isOk(res) ? res.data : null;
    }
    if (typeof workerOrFn === 'function') {
      const res = wrapResult(() => {
        if (scriptUrl) URL.revokeObjectURL(scriptUrl);
        const script = createPopoverWorkerScript<TContext>(workerOrFn);
        scriptUrl = URL.createObjectURL(new Blob([script], { type: 'application/javascript' }));
        return new Worker(scriptUrl);
      });
      return isOk(res) ? res.data : null;
    }
    return null;
  };

  worker = initWorker();

  const terminate = () => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    if (scriptUrl) {
      URL.revokeObjectURL(scriptUrl);
      scriptUrl = null;
    }
  };

  const resolver: PopoverResolver<TData, TContext> = (key, parentData, context, signal) => {
    if (!worker) {
      if (typeof workerOrFn === 'function') {
        return Promise.resolve(workerOrFn(key, parentData, context));
      }
      return Promise.reject(new Error('Web Worker environment is unavailable'));
    }
    reqId = (reqId + 1) % 0x7fffffff || 1;
    return executeWorkerTask({
      worker,
      requestId: reqId,
      key,
      parentData,
      context,
      signal,
      options,
      onWorkerError: (err) => {
        options.onWorkerError?.(err);
        if (options.autoRestart ?? true) {
          terminate();
          worker = initWorker();
        }
      },
    });
  };

  const disposables: WorkerResolverDisposables = {
    terminate,
    destroy: terminate,
    dispose: terminate,
    [DISPOSE_SYMBOL]: terminate,
  };
  return Object.assign(resolver, disposables);
}
