/**
 * Storage Adapters for Popover Trail Persistence.
 *
 * @module store/persistence/storageAdapter
 */

import { wrapResult, unwrapOr } from '../../utils/result';
import { isBrowser } from '../../utils/typeGuards';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear?(): void;
}

/**
 * Creates an in-memory Map-backed StorageAdapter for non-browser or testing environments.
 */
export function createMemoryStorageAdapter(): StorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

function createWebStorageAdapter(storage: Storage | undefined): StorageAdapter {
  if (!storage) {
    return createMemoryStorageAdapter();
  }
  return {
    getItem: (key) =>
      unwrapOr(
        wrapResult(() => storage.getItem(key)),
        null,
      ),
    setItem: (key, value) => {
      wrapResult(() => storage.setItem(key, value));
    },
    removeItem: (key) => {
      wrapResult(() => storage.removeItem(key));
    },
    clear: () => {
      wrapResult(() => storage.clear());
    },
  };
}

/**
 * Creates a browser localStorage-backed StorageAdapter with memory fallback.
 */
export function createLocalStorageAdapter(): StorageAdapter {
  const storage = isBrowser() ? window.localStorage : undefined;
  return createWebStorageAdapter(storage);
}

/**
 * Creates a browser sessionStorage-backed StorageAdapter with memory fallback.
 */
export function createSessionStorageAdapter(): StorageAdapter {
  const storage = isBrowser() ? window.sessionStorage : undefined;
  return createWebStorageAdapter(storage);
}
