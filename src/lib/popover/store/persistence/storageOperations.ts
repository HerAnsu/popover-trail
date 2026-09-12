/**
 * Fault-Tolerant Platform Storage Operations.
 *
 * @module store/persistence/storageOperations
 */

import { wrapResult } from '../../utils/result';
import { isBrowser } from '../../utils/typeGuards';
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
 * Reads an item from storage safely.
 */
export function readStorageItem(storage: Storage, key: string): string | null {
  const result = wrapResult(() => storage.getItem(key));
  return result.success ? result.data : null;
}

/**
 * Writes an item to storage safely.
 */
export function writeStorageItem(storage: Storage, key: string, raw: string): boolean {
  const result = wrapResult(() => storage.setItem(key, raw));
  return result.success;
}

/**
 * Removes an item from storage safely.
 */
export function removeStorageItem(storage: Storage, key: string): void {
  wrapResult(() => storage.removeItem(key));
}
