/**
 * Fault-Tolerant Platform Storage Operations.
 *
 * @module store/persistence/storageOperations
 */

import { wrapResult } from '../../utils/result';
import { isBrowser } from '../../utils/typeGuards';
import type { StorageKey, Unbrand } from '../../types';
import type { PlatformStorageType } from './persistenceTypes';

/**
 * Resolves window platform storage instance safely returning null if unavailable.
 */
export function resolvePlatformStorage(type: PlatformStorageType): Storage | null {
  if (!isBrowser()) return null;
  const result = wrapResult(() => window[type]);
  return result.success ? result.data : null;
}

/**
 * Reads an item from storage safely. Accepts both branded StorageKey and unbranded raw key string.
 */
export function readStorageItem(
  storage: Storage,
  key: StorageKey | Unbrand<StorageKey>,
): string | null {
  const result = wrapResult(() => storage.getItem(key));
  return result.success ? result.data : null;
}

/**
 * Writes an item to storage safely. Accepts both branded StorageKey and unbranded raw key string.
 */
export function writeStorageItem(
  storage: Storage,
  key: StorageKey | Unbrand<StorageKey>,
  raw: string,
): boolean {
  const result = wrapResult(() => storage.setItem(key, raw));
  return result.success;
}

/**
 * Removes an item from storage safely. Accepts both branded StorageKey and unbranded raw key string.
 */
export function removeStorageItem(storage: Storage, key: StorageKey | Unbrand<StorageKey>): void {
  wrapResult(() => storage.removeItem(key));
}
