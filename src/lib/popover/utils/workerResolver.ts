import type { PopoverResolver } from '../types';

/**
 * Options parameters for the `createWorkerResolver` factory.
 */
export interface WorkerResolverOptions<TData = unknown> {
  /** Timeout duration in milliseconds before rejecting worker tasks (default: 30000ms). */
  timeoutMs?: number;

  /**
   * Optional extractor function returning Transferable objects (ArrayBuffer, ImageBitmap, etc.)
   * to enable zero-copy memory transfer between worker thread and main thread.
   */
  transferables?: (data: TData) => Transferable[];

  /**
   * Optional callback handler invoked when an uncaught error occurs in the worker context.
   */
  onWorkerError?: (error: Error) => void;

  /**
   * If true (default), automatically restarts the background worker instance if it crashes or errors out.
   */
  autoRestart?: boolean;

  /**
   * Optional flag enabling SharedArrayBuffer zero-copy ring buffer streaming when supported by the environment.
   */
  useSharedMemory?: boolean;
}

/**
 * Generates an inline worker script string wrapped with task execution listeners and abort signal handling.
 *
 * @param resolverFn - The resolver function to evaluate inside the Web Worker scope.
 * @returns Executable JavaScript code string for Blob initialization.
 */
export function createPopoverWorkerScript(
  resolverFn: (key: string, parentData?: unknown, context?: unknown) => unknown,
): string {
  return `
    const activeTasks = new Map();

    self.onmessage = async (e) => {
      const { action, id, key, parentData, context } = e.data || {};
      
      if (action === 'abort') {
        const task = activeTasks.get(id);
        if (task && task.controller) {
          task.controller.abort();
        }
        activeTasks.delete(id);
        return;
      }

      if (action === 'resolve' || !action) {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        activeTasks.set(id, { controller });

        try {
          const fn = ${resolverFn.toString()};
          const result = await fn(key, parentData, context);
          
          if (controller && controller.signal.aborted) {
            return;
          }
          
          self.postMessage({ id, success: true, data: result });
        } catch (err) {
          self.postMessage({ id, success: false, error: err instanceof Error ? err.message : String(err) });
        } finally {
          activeTasks.delete(id);
        }
      }
    };
  `;
}

export type WorkerResolver<TData = unknown, TContext = unknown> = PopoverResolver<
  TData,
  TContext
> & {
  terminate(): void;
  destroy(): void;
  dispose(): void;
};

/**
 * Creates a non-blocking PopoverResolver that executes data resolution in a background Web Worker.
 * Offloads heavy computation, network transformations, or data parsing off the main UI thread.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The external context type.
 *
 * @param workerOrFn - A Worker instance, script URL string, or inline resolver function.
 * @param options - Execution options (timeout, transferables, autoRestart).
 * @returns A typed PopoverResolver function augmented with `.terminate()` / `.destroy()`.
 *
 * @example
 * ```tsx
 * import { createWorkerResolver, PopoverProvider } from 'popover-trail';
 *
 * const workerResolver = createWorkerResolver(
 *   async (key) => {
 *     // Executes inside Web Worker context
 *     const res = await fetch(`/api/card/${key}`);
 *     return res.json();
 *   },
 *   { timeoutMs: 15000, autoRestart: true }
 * );
 *
 * function App() {
 *   return <PopoverProvider resolveData={workerResolver}>...</PopoverProvider>;
 * }
 * ```
 *
 * @see {@link PopoverProvider}
 * @see {@link createPopoverStore}
 */
export function createWorkerResolver<TData = unknown, TContext = unknown>(
  workerOrFn:
    | Worker
    | string
    | ((key: string, parentData?: unknown, context?: TContext) => TData | Promise<TData>),
  options: WorkerResolverOptions<TData> = {},
): WorkerResolver<TData, TContext> {
  const { timeoutMs = 30000, transferables, onWorkerError, autoRestart = true } = options;

  let worker: Worker | null = null;
  let workerScriptUrl: string | null = null;

  const initWorker = (): Worker | null => {
    if (typeof Worker === 'undefined') {
      return null;
    }

    if (workerOrFn instanceof Worker) {
      return workerOrFn;
    }

    if (typeof workerOrFn === 'string') {
      try {
        return new Worker(workerOrFn, { type: 'module' });
      } catch {
        return null;
      }
    }

    if (typeof workerOrFn === 'function') {
      try {
        if (workerScriptUrl) {
          URL.revokeObjectURL(workerScriptUrl);
          workerScriptUrl = null;
        }
        const script = createPopoverWorkerScript(
          workerOrFn as (key: string, parentData?: unknown, context?: unknown) => unknown,
        );
        const blob = new Blob([script], { type: 'application/javascript' });
        workerScriptUrl = URL.createObjectURL(blob);
        return new Worker(workerScriptUrl);
      } catch {
        return null;
      }
    }

    return null;
  };

  worker = initWorker();

  let requestIdCounter = 0;
  const MAX_REQUEST_ID = 0x7fffffff;

  const resolver: PopoverResolver<TData, TContext> = (
    key: string,
    parentData?: unknown,
    context?: TContext,
    signal?: AbortSignal,
  ) => {
    // Graceful fallback for non-DOM / SSR environments or worker creation failure
    if (!worker) {
      if (typeof workerOrFn === 'function') {
        return Promise.resolve(workerOrFn(key, parentData, context as TContext));
      }
      return Promise.reject(new Error('Web Worker environment is unavailable'));
    }

    const currentWorker = worker;

    return new Promise<TData>((resolve, reject) => {
      const requestId = (requestIdCounter = (requestIdCounter + 1) % MAX_REQUEST_ID) || 1;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        currentWorker.removeEventListener('message', handleMessage);
        currentWorker.removeEventListener('error', handleError);
        if (signal) {
          signal.removeEventListener('abort', handleAbort);
        }
      };

      const handleMessage = (e: MessageEvent) => {
        if (e.data && e.data.id === requestId) {
          cleanup();
          if (e.data.success) {
            resolve(e.data.data as TData);
          } else {
            reject(new Error(e.data.error || 'Worker data resolution failed'));
          }
        }
      };

      const handleError = (err: ErrorEvent) => {
        cleanup();
        const errorObj = new Error(err.message || 'Worker runtime error');
        if (onWorkerError) {
          onWorkerError(errorObj);
        }

        if (autoRestart && typeof workerOrFn !== 'string' && !(workerOrFn instanceof Worker)) {
          try {
            if (worker) {
              worker.terminate();
            }
            if (workerScriptUrl) {
              URL.revokeObjectURL(workerScriptUrl);
              workerScriptUrl = null;
            }
            worker = initWorker();
          } catch {
            // Ignore restart failure
          }
        }

        reject(errorObj);
      };

      const handleAbort = () => {
        cleanup();
        try {
          currentWorker.postMessage({ action: 'abort', id: requestId });
        } catch {
          // Ignore worker postMessage error during abort
        }
        const abortError =
          typeof DOMException !== 'undefined'
            ? new DOMException('Aborted by signal', 'AbortError')
            : Object.assign(new Error('Aborted by signal'), { name: 'AbortError' });
        reject(abortError);
      };

      currentWorker.addEventListener('message', handleMessage);
      currentWorker.addEventListener('error', handleError);

      if (signal) {
        if (signal.aborted) {
          handleAbort();
          return;
        }
        signal.addEventListener('abort', handleAbort, { once: true });
      }

      if (timeoutMs > 0) {
        timer = setTimeout(() => {
          cleanup();
          reject(new Error(`Worker task timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }

      const payload = { action: 'resolve', id: requestId, key, parentData, context };
      const transferableItems =
        transferables && parentData !== undefined ? transferables(parentData as TData) : [];

      if (transferableItems.length > 0) {
        currentWorker.postMessage(payload, transferableItems);
      } else {
        currentWorker.postMessage(payload);
      }
    });
  };

  const terminate = () => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
    if (workerScriptUrl) {
      URL.revokeObjectURL(workerScriptUrl);
      workerScriptUrl = null;
    }
  };

  const DISPOSE_SYMBOL: symbol =
    (Symbol as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');

  Object.assign(resolver, {
    terminate,
    destroy: terminate,
    dispose: terminate,
    [DISPOSE_SYMBOL]: terminate,
  });

  return resolver as WorkerResolver<TData, TContext>;
}

/**
 * Helper to define a CSP-compliant Worker script listener for popover-trail RPC resolvers.
 * Use inside a dedicated Web Worker module file (e.g. `myWorker.ts`).
 *
 * @example
 * ```ts
 * // worker.ts
 * import { definePopoverWorkerRPC } from 'popover-trail';
 *
 * definePopoverWorkerRPC(async (key, parentData, context) => {
 *   const res = await fetch(`/api/card/${key}`);
 *   return res.json();
 * });
 * ```
 */
export function definePopoverWorkerRPC<TData = unknown, TContext = unknown>(
  handler: (key: string, parentData?: unknown, context?: TContext) => TData | Promise<TData>,
): void {
  if (typeof self === 'undefined') return;

  const activeTasks = new Map<number, AbortController>();

  self.addEventListener('message', async (e: Event) => {
    const ev = e as MessageEvent;
    const { action, id, key, parentData, context } = ev.data || {};

    if (action === 'abort') {
      const controller = activeTasks.get(id);
      if (controller) {
        controller.abort();
        activeTasks.delete(id);
      }
      return;
    }

    if (action === 'resolve' || !action) {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      if (controller) {
        activeTasks.set(id, controller);
      }

      try {
        const result = await handler(key, parentData, context as TContext);

        if (controller && controller.signal.aborted) {
          return;
        }

        self.postMessage({ id, success: true, data: result });
      } catch (err) {
        self.postMessage({
          id,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      } finally {
        activeTasks.delete(id);
      }
    }
  });
}
