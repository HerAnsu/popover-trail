/**
 * Storage Engine Resolver for Persistence Slice.
 *
 * @module store/slices/persistence/storageEngineResolver
 */

import type { PopoverPersistConfig, StateStorageEngine } from '../../../types';
import { isBrowser } from '../../../utils/typeGuards';

export interface ResolvedStorageEngine {
  readonly storageKey: string;
  readonly engine: StateStorageEngine | Storage | null;
}

/**
 * Resolves storage key and target storage engine from configuration.
 *
 * @example
 * ```ts
 * const { storageKey, engine } = resolveStorageEngine(persistConfig);
 * ```
 *
 * @param config - Optional persistence configuration options.
 * @returns Object containing resolved `storageKey` and `engine`.
 */
export function resolveStorageEngine(config?: PopoverPersistConfig): ResolvedStorageEngine {
  const storageKey = config?.key ?? 'popover-trail-state';
  const engine =
    config?.storage ?? (isBrowser() && window.sessionStorage ? window.sessionStorage : null);
  return { storageKey, engine };
}
