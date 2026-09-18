/**
 * Worker Script Code Generation for Blob Workers.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module utils/worker/workerScript
 */

export function createPopoverWorkerScript<TContext = unknown>(
  resolverFn: (key: string, parentData?: unknown, context?: TContext) => unknown,
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
