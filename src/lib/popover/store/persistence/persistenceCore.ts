/**
 * Shared Persistence Kernel for popover-trail.
 * Common storage-engine resolution, serialization, and guarded I/O primitives
 * consumed by both the cross-tab PopoverSnapshotManager and the store-level
 * persist/rehydrate actions. Formats of the two subsystems stay independent;
 * only the mechanics are shared so they cannot drift apart.
 *
 * @module store/persistence/persistenceCore
 */

import { isOk, wrapResult } from '../../utils/result';

/** Platform storage buckets addressable by the persistence subsystems. */
export type PlatformStorageType = 'localStorage' | 'sessionStorage';

/**
 * Safely resolves a platform storage bucket.
 *
 * @param type - Target storage bucket.
 * @returns The Storage handle, or `null` on SSR/denied access.
 */
export function resolvePlatformStorage(type: PlatformStorageType): Storage | null {
  if (typeof window === 'undefined') return null;
  const result = wrapResult(() => window[type]);
  return isOk(result) ? result.data : null;
}

/**
 * Serializes a value to JSON, returning `null` instead of throwing on cycles.
 */
export function serializeJson(value: unknown): string | null {
  const result = wrapResult(() => JSON.stringify(value));
  return isOk(result) ? result.data : null;
}

/**
 * Reads a raw string from storage without throwing on inaccessible engines.
 */
export function readStorageItem(storage: Storage, key: string): string | null {
  const result = wrapResult(() => storage.getItem(key));
  return isOk(result) ? result.data : null;
}

/**
 * Writes a raw string to storage without throwing on quota/engine errors.
 *
 * @returns `true` on success.
 */
export function writeStorageItem(storage: Storage, key: string, raw: string): boolean {
  return isOk(wrapResult(() => storage.setItem(key, raw)));
}

/**
 * Removes a key from storage without throwing on inaccessible engines.
 */
export function removeStorageItem(storage: Storage, key: string): void {
  wrapResult(() => storage.removeItem(key));
}
