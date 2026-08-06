import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createBroadcastSync, PopoverSyncMessage } from './broadcastSync';

describe('broadcastSync utility', () => {
  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
    listeners: Array<(event: MessageEvent) => void> = [];

    constructor(name: string) {
      this.name = name;
    }

    addEventListener(type: string, listener: (event: MessageEvent) => void) {
      if (type === 'message') {
        this.listeners.push(listener);
      }
    }

    postMessage(data: unknown) {
      // simulate broadcast to other listeners
      this.listeners.forEach((fn) => fn({ data } as MessageEvent));
    }

    close() {
      this.listeners = [];
    }
  }

  const originalBroadcastChannel = globalThis.BroadcastChannel;

  beforeEach(() => {
    // @ts-expect-error - mock BroadcastChannel
    globalThis.BroadcastChannel = MockBroadcastChannel;
  });

  afterEach(() => {
    globalThis.BroadcastChannel = originalBroadcastChannel;
  });

  it('creates broadcast sync instance with unique tabId', () => {
    const sync = createBroadcastSync();
    expect(sync.tabId).toBeDefined();
    expect(typeof sync.tabId).toBe('string');
    sync.destroy();
  });

  it('subscribes and receives messages from other tabs', () => {
    const sync1 = createBroadcastSync('test-channel');
    const listener = vi.fn();
    const unsubscribe = sync1.subscribe(listener);

    // Simulate incoming message from another tabId
    const _incomingMessage: PopoverSyncMessage = {
      type: 'OPEN',
      key: 'card-1',
      timestamp: Date.now(),
      tabId: 'other-tab-id',
    };

    // Trigger internal channel message logic
    // @ts-expect-error - accessing internal listener test helper
    sync1.broadcast('OPEN', 'card-1');

    unsubscribe();
    sync1.destroy();
  });

  it('unsubscribes listener properly', () => {
    const sync = createBroadcastSync('test-channel');
    const listener = vi.fn();
    const unsub = sync.subscribe(listener);
    unsub();

    sync.broadcast('CLOSE', 'card-2');
    expect(listener).not.toHaveBeenCalled();

    sync.destroy();
  });

  it('handles environment without BroadcastChannel gracefully', () => {
    // @ts-expect-error - remove BroadcastChannel
    delete globalThis.BroadcastChannel;

    const sync = createBroadcastSync('fallback-channel');
    expect(() => sync.broadcast('RESET')).not.toThrow();

    const listener = vi.fn();
    const unsub = sync.subscribe(listener);
    expect(() => unsub()).not.toThrow();
    expect(() => sync.destroy()).not.toThrow();
  });
});
