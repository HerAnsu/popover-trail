/**
 * Dedicated Web Worker RPC Message Router and Listener.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module utils/worker/workerRpc
 */

import { wrapAsyncResult, isOk } from '../result';
import type { WorkerTaskMessage } from './workerTypes';

function handleWorkerAbort(activeTasks: Map<number, AbortController>, id: number): void {
  const controller = activeTasks.get(id);
  if (controller) {
    controller.abort();
    activeTasks.delete(id);
  }
}

async function handleWorkerResolve<TData, TContext>(
  selfScope: WindowOrWorkerGlobalScope & { postMessage(message: unknown): void },
  activeTasks: Map<number, AbortController>,
  msg: WorkerTaskMessage<TContext>,
  handler: (key: string, parentData?: unknown, context?: TContext) => TData | Promise<TData>,
): Promise<void> {
  const { id, key = '', parentData, context } = msg;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  if (controller) activeTasks.set(id, controller);

  const taskResult = await wrapAsyncResult(
    Promise.resolve().then(() => handler(key, parentData, context)),
  );
  if (controller?.signal.aborted) {
    activeTasks.delete(id);
    return;
  }

  if (isOk(taskResult)) {
    selfScope.postMessage({ id, success: true, data: taskResult.data });
  } else {
    selfScope.postMessage({ id, success: false, error: taskResult.error.message });
  }
  activeTasks.delete(id);
}

function isWorkerTaskMessage<TContext>(data: unknown): data is WorkerTaskMessage<TContext> {
  return typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'number';
}

export function definePopoverWorkerRPC<TData = unknown, TContext = unknown>(
  handler: (key: string, parentData?: unknown, context?: TContext) => TData | Promise<TData>,
): void {
  if (typeof self === 'undefined') return;
  const activeTasks = new Map<number, AbortController>();

  self.addEventListener('message', async (e) => {
    if (!('data' in e) || !isWorkerTaskMessage<TContext>(e.data)) return;
    const msg = e.data;
    if (msg.action === 'abort') {
      handleWorkerAbort(activeTasks, msg.id);
      return;
    }
    if (msg.action === 'resolve' || !msg.action) {
      await handleWorkerResolve(self, activeTasks, msg, handler);
    }
  });
}
