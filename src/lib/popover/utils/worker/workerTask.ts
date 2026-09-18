/**
 * Single Task Execution Over Worker PostMessage Transport.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module utils/worker/workerTask
 */

import { wrapResult } from '../result';
import type { WorkerResolverOptions, WorkerResponseMessage } from './workerTypes';

export interface TaskParams<TData, TContext> {
  worker: Worker;
  requestId: number;
  key: string;
  parentData?: TData;
  context?: TContext;
  signal?: AbortSignal;
  options: WorkerResolverOptions<TData>;
  onWorkerError?: (err: Error) => void;
}

export function executeWorkerTask<TData, TContext>(
  params: TaskParams<TData, TContext>,
): Promise<TData> {
  const { worker, requestId, key, parentData, context, signal, options, onWorkerError } = params;
  const timeoutMs = options.timeoutMs ?? 30000;

  return new Promise<TData>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      if (signal) signal.removeEventListener('abort', handleAbort);
    };

    const handleMessage = (e: MessageEvent<WorkerResponseMessage<TData>>) => {
      const msg = e.data;
      if (msg?.id === requestId) {
        cleanup();
        if (msg.success) resolve(msg.data);
        else reject(new Error(msg.error || 'Worker data resolution failed'));
      }
    };

    const handleError = (err: ErrorEvent) => {
      cleanup();
      const errorObj = new Error(err.message || 'Worker runtime error');
      onWorkerError?.(errorObj);
      reject(errorObj);
    };

    const handleAbort = () => {
      cleanup();
      wrapResult(() => worker.postMessage({ action: 'abort', id: requestId }));
      const abortError =
        typeof DOMException !== 'undefined'
          ? new DOMException('Aborted by signal', 'AbortError')
          : Object.assign(new Error('Aborted by signal'), { name: 'AbortError' });
      reject(abortError);
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    if (signal) {
      if (signal.aborted) return handleAbort();
      signal.addEventListener('abort', handleAbort, { once: true });
    }

    if (timeoutMs > 0) {
      timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Worker task timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }

    const payload = { action: 'resolve', id: requestId, key, parentData, context };
    const transferables =
      options.transferables && parentData !== undefined ? options.transferables(parentData) : [];

    if (transferables.length > 0) worker.postMessage(payload, transferables);
    else worker.postMessage(payload);
  });
}
