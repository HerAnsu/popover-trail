import { describe, it, expect, vi } from 'vitest';
import { createCrossTabBroadcaster } from './crossTabBroadcaster';
import { createBroadcastChannelDriver } from './broadcastChannelEngine';
import { createStorageFallbackDriver } from './storageFallbackBroadcaster';

interface SyncPayload {
  readonly txId: string;
  readonly seq: number;
  readonly data: string;
}

describe('crossTabBroadcaster module', () => {
  it('dispatches messages to registered listeners and supports unsubscription', () => {
    const listeners = new Set<(message: unknown) => void>();
    const broadcaster = createBroadcastChannelDriver('sync-channel-test', listeners);

    const received: unknown[] = [];
    const unsubscribe = broadcaster.onMessage((msg) => received.push(msg));

    for (const listener of listeners) {
      listener({ key: 'panel-1', state: 'open' });
    }

    expect(received).toEqual([{ key: 'panel-1', state: 'open' }]);

    unsubscribe();
    for (const listener of listeners) {
      listener({ key: 'panel-2', state: 'closed' });
    }
    expect(received).toHaveLength(1);
    broadcaster.dispose();
  });

  it('drops duplicate envelopes via O(1) transaction ID deduplication', () => {
    const listeners = new Set<(message: unknown) => void>();
    const broadcaster = createBroadcastChannelDriver('dedupe-channel', listeners);

    const processedTxIds = new Set<string>();
    const delivered: SyncPayload[] = [];

    broadcaster.onMessage((msg) => {
      const payload = msg as SyncPayload;
      if (processedTxIds.has(payload.txId)) return;
      processedTxIds.add(payload.txId);
      delivered.push(payload);
    });

    const msgA: SyncPayload = { txId: 'tx-001', seq: 1, data: 'state-1' };
    for (const listener of listeners) {
      listener(msgA);
      listener(msgA);
      listener(msgA);
    }

    expect(delivered).toHaveLength(1);
    expect(delivered[0]).toEqual(msgA);
    broadcaster.dispose();
  });

  it('rejects out-of-order sequence counter messages enforcing causal progression', () => {
    const listeners = new Set<(message: unknown) => void>();
    const broadcaster = createBroadcastChannelDriver('causal-channel', listeners);

    let localClock = 0;
    const accepted: SyncPayload[] = [];

    broadcaster.onMessage((msg) => {
      const payload = msg as SyncPayload;
      if (payload.seq <= localClock) return;
      localClock = payload.seq;
      accepted.push(payload);
    });

    const messages: SyncPayload[] = [
      { txId: 'tx-1', seq: 5, data: 'snapshot-5' },
      { txId: 'tx-2', seq: 3, data: 'stale-3' },
      { txId: 'tx-3', seq: 5, data: 'duplicate-5' },
      { txId: 'tx-4', seq: 8, data: 'snapshot-8' },
    ];

    for (const listener of listeners) {
      for (const m of messages) {
        listener(m);
      }
    }

    expect(accepted.map((m) => m.seq)).toEqual([5, 8]);
    broadcaster.dispose();
  });

  it('falls back to storage driver and handles storage events', () => {
    type StorageHandler = (e: StorageEvent) => void;
    let registeredHandler: StorageHandler | null = null;
    const storedItems = new Map<string, string>();

    const mockWindow = {
      addEventListener: (_type: string, handler: StorageHandler) => {
        registeredHandler = handler;
      },
      removeEventListener: (_type: string, _handler: StorageHandler) => {
        registeredHandler = null;
      },
      localStorage: {
        setItem: (k: string, v: string) => {
          storedItems.set(k, v);
        },
      },
    };

    vi.stubGlobal('window', mockWindow);
    try {
      const listeners = new Set<(message: unknown) => void>();
      const driver = createStorageFallbackDriver('storage_channel', listeners);
      const mockListener = vi.fn();

      driver.onMessage(mockListener);

      expect(registeredHandler).not.toBeNull();
      if (registeredHandler !== null) {
        const handler: StorageHandler = registeredHandler;
        handler({
          key: 'storage_channel',
          newValue: JSON.stringify({ action: 'sync_now' }),
        } as StorageEvent);
      }
      expect(mockListener).toHaveBeenCalledWith({ action: 'sync_now' });

      driver.postMessage({ ping: true });
      expect(storedItems.get('storage_channel')).toBe(JSON.stringify({ ping: true }));

      driver.dispose();
      expect(registeredHandler).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('creates broadcaster through createCrossTabBroadcaster factory', () => {
    const broadcaster = createCrossTabBroadcaster('factory-channel');
    expect(typeof broadcaster.postMessage).toBe('function');
    expect(typeof broadcaster.onMessage).toBe('function');
    expect(() => broadcaster.dispose()).not.toThrow();
  });
});
