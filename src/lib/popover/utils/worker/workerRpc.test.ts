import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { definePopoverWorkerRPC } from './workerRpc';

interface MockWorkerScope {
  addEventListener: (
    type: string,
    listener: (e: { data: unknown }) => Promise<void> | void,
  ) => void;
  postMessage: (message: unknown) => void;
}

describe('workerRpc - definePopoverWorkerRPC', () => {
  let originalSelf: unknown;
  let listeners: ((e: { data: unknown }) => Promise<void> | void)[];
  let postedMessages: unknown[];
  let mockScope: MockWorkerScope;

  beforeEach(() => {
    originalSelf = Reflect.get(globalThis, 'self');
    listeners = [];
    postedMessages = [];

    mockScope = {
      addEventListener: vi.fn((_type: string, listener) => {
        listeners.push(listener);
      }),
      postMessage: vi.fn((message: unknown) => {
        postedMessages.push(message);
      }),
    };

    Reflect.set(globalThis, 'self', mockScope);
  });

  afterEach(() => {
    if (originalSelf === undefined) {
      Reflect.deleteProperty(globalThis, 'self');
    } else {
      Reflect.set(globalThis, 'self', originalSelf);
    }
    vi.restoreAllMocks();
  });

  async function dispatchMessage(data: unknown): Promise<void> {
    await Promise.all(listeners.map((listener) => listener({ data })));
  }

  it('safely handles SSR or non-worker environments where self is undefined', () => {
    Reflect.deleteProperty(globalThis, 'self');
    expect(() => definePopoverWorkerRPC(() => 'result')).not.toThrow();
  });

  it('handles synchronous and asynchronous RPC resolutions with matched requestId', async () => {
    definePopoverWorkerRPC((key, parentData, context) => ({
      key,
      parentData,
      context,
      echo: true,
    }));

    await dispatchMessage({
      id: 101,
      action: 'resolve',
      key: 'item-node',
      parentData: { label: 'Parent' },
      context: { theme: 'dark' },
    });

    expect(postedMessages).toEqual([
      {
        id: 101,
        success: true,
        data: {
          key: 'item-node',
          parentData: { label: 'Parent' },
          context: { theme: 'dark' },
          echo: true,
        },
      },
    ]);
  });

  it('captures errors and posts failure messages back to main thread', async () => {
    definePopoverWorkerRPC((key) => {
      if (key === 'fail') {
        throw new Error('Computation failed unexpectedly');
      }
      return 'ok';
    });

    await dispatchMessage({ id: 202, key: 'fail' });

    expect(postedMessages).toHaveLength(1);
    const firstMsg = postedMessages[0] as { id: number; success: boolean; error: string };
    expect(firstMsg.id).toBe(202);
    expect(firstMsg.success).toBe(false);
    expect(firstMsg.error).toContain('Computation failed unexpectedly');
  });

  it('suppresses completion postMessage when in-flight task is aborted', async () => {
    let resolveTask: ((val: string) => void) | undefined;
    definePopoverWorkerRPC(
      () =>
        new Promise<string>((resolve) => {
          resolveTask = resolve;
        }),
    );

    const pendingPromise = dispatchMessage({ id: 303, action: 'resolve', key: 'long-job' });

    // Send abort while job is in flight
    await dispatchMessage({ id: 303, action: 'abort' });

    if (resolveTask) {
      resolveTask('delayed result');
    }
    await pendingPromise;

    expect(postedMessages).toHaveLength(0);
  });

  it('ignores malformed messages without valid numeric id or non-object payloads', async () => {
    definePopoverWorkerRPC(() => 'should-not-run');

    await dispatchMessage(null);
    await dispatchMessage('plain string');
    await dispatchMessage({ key: 'no-id' });
    await dispatchMessage({ id: 'string-id' });

    expect(postedMessages).toHaveLength(0);
  });
});
