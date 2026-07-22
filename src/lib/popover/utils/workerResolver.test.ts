import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createWorkerResolver, createPopoverWorkerScript } from './workerResolver';

describe('workerResolver', () => {
  const originalWorker = globalThis.Worker;

  beforeEach(() => {
    globalThis.Worker = originalWorker;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
  });

  it('generates executable worker script with createPopoverWorkerScript', () => {
    const script = createPopoverWorkerScript((key) => ({ key, data: 'test' }));
    expect(script).toContain('self.onmessage = async (e) => {');
    expect(script).toContain('activeTasks');
    expect(script).toContain("action === 'abort'");
  });

  it('falls back synchronously when Worker API is undefined (SSR environment)', async () => {
    Reflect.deleteProperty(globalThis, 'Worker');

    const mockResolverFn = vi.fn().mockImplementation((key: string) => ({
      title: `Resolved ${key}`,
    }));

    const resolver = createWorkerResolver(mockResolverFn);
    const result = await resolver('node-1');

    expect(result).toEqual({ title: 'Resolved node-1' });
    expect(mockResolverFn).toHaveBeenCalledWith('node-1', undefined, undefined);
  });

  it('rejects when Worker API is absent and worker is a URL string', async () => {
    Reflect.deleteProperty(globalThis, 'Worker');

    const resolver = createWorkerResolver('/worker.js');
    await expect(resolver('node-1')).rejects.toThrow('Web Worker environment is unavailable');
  });

  it('handles task cancellation when AbortSignal is aborted', async () => {
    const postMessageSpy = vi.fn();
    const addEventListenerSpy = vi.fn();
    const removeEventListenerSpy = vi.fn();
    const terminateSpy = vi.fn();

    class MockWorker {
      postMessage(data: unknown) {
        postMessageSpy(data);
      }
      addEventListener(type: string, listener: unknown) {
        addEventListenerSpy(type, listener);
      }
      removeEventListener(type: string, listener: unknown) {
        removeEventListenerSpy(type, listener);
      }
      terminate() {
        terminateSpy();
      }
    }

    // @ts-expect-error Mocking global Worker
    globalThis.Worker = MockWorker;

    const controller = new AbortController();
    const resolver = createWorkerResolver('/worker.js');

    const promise = resolver('node-abort', undefined, undefined, controller.signal);
    controller.abort();

    await expect(promise).rejects.toThrow('Aborted by signal');
    expect(postMessageSpy).toHaveBeenCalledWith({ action: 'abort', id: 1 });
  });

  it('handles worker task timeout when timeoutMs is exceeded', async () => {
    const timeoutPostMessage = vi.fn();
    const timeoutAddEventListener = vi.fn();
    const timeoutRemoveEventListener = vi.fn();

    class MockWorker {
      postMessage(data: unknown) {
        timeoutPostMessage(data);
      }
      addEventListener(type: string, listener: unknown) {
        timeoutAddEventListener(type, listener);
      }
      removeEventListener(type: string, listener: unknown) {
        timeoutRemoveEventListener(type, listener);
      }
    }

    // @ts-expect-error Mocking global Worker
    globalThis.Worker = MockWorker;

    const resolver = createWorkerResolver('/worker.js', { timeoutMs: 50 });
    await expect(resolver('node-timeout')).rejects.toThrow('Worker task timed out after 50ms');
  });
});
