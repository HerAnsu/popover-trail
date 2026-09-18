/**
 * Fault-Tolerant Platform Storage Operations.
 *
 * @module store/persistence/storageOperations
 */

import { wrapResult, unwrapOr } from '../../utils/result';
import { isBrowser } from '../../utils/typeGuards';
import type { StorageKey, Unbrand } from '../../types';
import type { PlatformStorageType } from './persistenceTypes';

/**
 * Safely resolves a browser `Storage` instance (`localStorage` or `sessionStorage`).
 * Returns `null` if executing in a non-browser environment or if storage access is blocked by security policies.
 *
 * @param type - Platform storage type (`'localStorage'` or `'sessionStorage'`).
 * @returns The native `Storage` object or `null`.
 *
 * @example
 * ```typescript
 * const storage = resolvePlatformStorage('localStorage');
 * if (storage) {
 *   storage.getItem('my_key');
 * }
 * ```
 */
export function resolvePlatformStorage(type: PlatformStorageType): Storage | null {
  if (!isBrowser()) return null;
  return unwrapOr(wrapResult(() => window[type]), null);
}

/**
 * Reads an item from storage safely without throwing security or access errors.
 * Accepts both branded `StorageKey` and unbranded raw key strings.
 *
 * @param storage - Target Storage instance.
 * @param key - Storage key identifier.
 * @returns The stored string value, or `null` if not found or inaccessible.
 *
 * @example
 * ```typescript
 * const value = readStorageItem(localStorage, 'my_app_state');
 * ```
 */
export function readStorageItem(
  storage: Storage,
  key: StorageKey | Unbrand<StorageKey>,
): string | null {
  return unwrapOr(wrapResult(() => storage.getItem(key)), null);
}

/**
 * Writes a string value to storage safely without throwing quota exceeded or security errors.
 *
 * @param storage - Target Storage instance.
 * @param key - Storage key identifier.
 * @param raw - String content to persist.
 * @returns `true` if write succeeded, `false` if quota exceeded or storage threw an error.
 *
 * @example
 * ```typescript
 * const success = writeStorageItem(localStorage, 'my_app_state', jsonString);
 * ```
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
 * Removes an item from storage safely without throwing exceptions.
 *
 * @param storage - Target Storage instance.
 * @param key - Storage key identifier to remove.
 *
 * @example
 * ```typescript
 * removeStorageItem(localStorage, 'my_app_state');
 * ```
 */
export function removeStorageItem(storage: Storage, key: StorageKey | Unbrand<StorageKey>): void {
  wrapResult(() => storage.removeItem(key));
}
