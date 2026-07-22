import type { PopoverResolver } from '../types';

/**
 * Options parameters for the `createWorkerResolver` factory.
 */
export interface WorkerResolverOptions {
  /** Timeout duration in milliseconds before rejecting worker tasks (default: 30000ms). */
  timeoutMs?: number;
}

/**
 * Creates a non-blocking PopoverResolver that executes data resolution in a background Web Worker.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The external context type.
 *
 * @param workerOrFn - A Worker instance, script URL string, or inline resolver function.
 * @param options - Execution options.
 * @returns A typed PopoverResolver function.
 */
export function createWorkerResolver<TData = unknown, TContext = unknown>(
  workerOrFn:
    | Worker
    | string
    | ((key: string, parentData?: unknown, context?: TContext) => TData | Promise<TData>),
  options: WorkerResolverOptions = {},
): PopoverResolver<TData, TContext> {
  const { timeoutMs = 30000 } = options;

  let worker: Worker | null = null;

  if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
    if (workerOrFn instanceof Worker) {
      worker = workerOrFn;
    } else if (typeof workerOrFn === 'string') {
      try {
        worker = new Worker(workerOrFn, { type: 'module' });
      } catch {
        worker = null;
      }
    } else if (typeof workerOrFn === 'function') {
      try {
        const script = `
          self.onmessage = async (e) => {
            const { id, key, parentData, context } = e.data;
            try {
              const fn = ${workerOrFn.toString()};
              const result = await fn(key, parentData, context);
              self.postMessage({ id, success: true, data: result });
            } catch (err) {
              self.postMessage({ id, success: false, error: err instanceof Error ? err.message : String(err) });
            }
          };
        `;
        const blob = new Blob([script], { type: 'application/javascript' });
        const objectUrl = URL.createObjectURL(blob);
        worker = new Worker(objectUrl);
        URL.revokeObjectURL(objectUrl);
      } catch {
        worker = null;
      }
    }
  }

  let requestIdCounter = 0;

  return (key: string, parentData?: unknown, context?: TContext, signal?: AbortSignal) => {
    // Graceful fallback for non-DOM / SSR environments or worker creation failure
    if (!worker) {
      if (typeof workerOrFn === 'function') {
        return Promise.resolve(workerOrFn(key, parentData, context as TContext));
      }
      return Promise.reject(new Error('Web Worker environment is unavailable'));
    }

    const currentWorker = worker;

    return new Promise<TData>((resolve, reject) => {
      const requestId = ++requestIdCounter;
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
        reject(new Error(err.message || 'Worker runtime error'));
      };

      const handleAbort = () => {
        cleanup();
        reject(new DOMException('Aborted by signal', 'AbortError'));
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

      currentWorker.postMessage({ id: requestId, key, parentData, context });
    });
  };
}
