/**
 * Pure State Persistence & Rehydration Helper Functions for popover-trail.
 * Encapsulates serialization, sanitization, storage resolution, and transaction rollback routines.
 *
 * @module store/slices/persistenceHelpers
 */

import * as React from 'react';
import type {
  PopoverPersistConfig,
  TrailEntry,
  PopoverStateData,
  DragOffset,
  StatePatch,
  StateStorageEngine,
} from '../../types';

export const PERSIST_SCHEMA_VERSION = '1.1';
export const DEFAULT_STORAGE_KEY = 'popover_store_state';
export const UNSAFE_KEYS_SET = Object.freeze(new Set(['__proto__', 'constructor', 'prototype']));

/**
 * Validates that a key is a safe string without prototype pollution vectors.
 *
 * @param key - Candidate key identifier.
 * @returns `true` if safe.
 */
export function isSafeKey(key: unknown): key is string {
  return typeof key === 'string' && key.trim().length > 0 && !UNSAFE_KEYS_SET.has(key);
}

/**
 * Type guard verifying if a string key belongs to a typed Set.
 *
 * @template K - String key union.
 * @param key - Target string key.
 * @param set - Set of valid keys.
 * @returns `true` if member of set.
 */
export function isKeyInSet<K extends string>(key: string, set: Set<K>): key is K {
  return set.has(key as K);
}

/**
 * Resolves the active storage key and engine (localStorage / sessionStorage / custom).
 *
 * @param config - Optional persistence configuration.
 * @returns Object with `{ storageKey, engine }`.
 */
export function resolveStorageEngine(config?: PopoverPersistConfig): {
  storageKey: string;
  engine: Storage | StateStorageEngine | null;
} {
  const storageKey = config?.storageKey ?? config?.key ?? DEFAULT_STORAGE_KEY;
  const engine =
    config?.storage ??
    (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);
  return { storageKey, engine };
}

/**
 * Type guard checking if an unknown value satisfies the `DragOffset` shape with finite numbers.
 *
 * @param val - Candidate value.
 * @returns `true` if valid finite offset `{ x, y }`.
 */
export function isDragOffset(val: unknown): val is DragOffset {
  return (
    typeof val === 'object' &&
    val !== null &&
    'x' in val &&
    typeof val.x === 'number' &&
    Number.isFinite(val.x) &&
    'y' in val &&
    typeof val.y === 'number' &&
    Number.isFinite(val.y)
  );
}

/**
 * Type guard verifying an unknown value is a non-null object record.
 *
 * @param val - Candidate value.
 * @returns `true` if plain object record.
 */
export function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Sanitizes persisted coordinate offsets against prototype pollution and non-finite values.
 *
 * @template TPopoverKey - Popover key string type.
 * @param offsets - Raw persisted offsets dictionary.
 * @param allowedKeys - Set of active allowed popover keys.
 * @returns Cleaned offsets map.
 */
export function sanitizePersistedOffsets<TPopoverKey extends string>(
  offsets: Record<string, unknown>,
  allowedKeys: ReadonlySet<TPopoverKey>,
): Partial<Record<TPopoverKey, DragOffset>> {
  const clean: Partial<Record<TPopoverKey, DragOffset>> = {};
  for (const key of allowedKeys) {
    if (!isSafeKey(key)) continue;
    const pt = offsets[key];
    if (isDragOffset(pt)) {
      clean[key] = { x: pt.x, y: pt.y };
    }
  }
  return clean;
}

/**
 * Strips non-serializable promise handles and invalid keys from persisted entries.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Popover key string type.
 * @param entries - List of trail entries to sanitize.
 * @returns Cleaned serializable list of entries.
 */
export function sanitizePersistedEntries<TData, TPopoverKey extends string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
): TrailEntry<TData, TPopoverKey>[] {
  return entries.flatMap((entry) => {
    if (!isSafeKey(entry.key)) return [];
    const cleanEntry: TrailEntry<TData, TPopoverKey> = { ...entry };
    delete cleanEntry.dataPromise;
    delete cleanEntry.onError;
    delete cleanEntry.onPin;
    delete cleanEntry.onClose;
    return [cleanEntry];
  });
}

/**
 * Aborts and removes active AbortControllers that were not present in the target snapshot.
 *
 * @param activeControllers - Map of in-flight AbortControllers.
 * @param snapshotControllers - Set of controller keys retained in snapshot.
 */
export function rollbackActiveControllers(
  activeControllers: Map<string, AbortController>,
  snapshotControllers: Set<string> | null,
): void {
  if (activeControllers.size === 0) return;
  for (const key of activeControllers.keys()) {
    if (!snapshotControllers?.has(key)) {
      const controller = activeControllers.get(key);
      if (controller) controller.abort();
      activeControllers.delete(key);
    }
  }
}

/**
 * Re-populates the PopoverDAG hierarchy nodes from trail and floating entries.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Popover key string type.
 * @param dag - PopoverDAG instance.
 * @param trail - Active cascading trail entries.
 * @param floating - Active pinned floating entries.
 */
export function restoreDAGFromState<TData, TPopoverKey extends string>(
  dag:
    | { clear: () => void; addNode: (key: TPopoverKey, parentKey?: TPopoverKey) => void }
    | undefined,
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  floating: readonly TrailEntry<TData, TPopoverKey>[],
): void {
  if (!dag) return;
  dag.clear();
  for (const entry of trail) {
    dag.addNode(entry.key, entry.parentKey);
  }
  for (const entry of floating) {
    dag.addNode(entry.key, entry.parentKey);
  }
}

/**
 * Parses and validates raw rehydrated floating entries.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Popover key string type.
 * @param rawFloating - Raw parsed floating entries array.
 * @returns Validated list of rehydrated TrailEntry objects.
 */
export function parseRehydratedFloatingEntries<TData, TPopoverKey extends string>(
  rawFloating: unknown,
): TrailEntry<TData, TPopoverKey>[] {
  if (!Array.isArray(rawFloating)) return [];

  const isRawEntry = (item: unknown): item is TrailEntry<TData, TPopoverKey> =>
    typeof item === 'object' &&
    item !== null &&
    'key' in item &&
    typeof item.key === 'string' &&
    isSafeKey(item.key);

  return rawFloating.flatMap((item) =>
    isRawEntry(item)
      ? [
          {
            ...item,
            status: 'success' as const,
            isLoading: false,
            error: null,
            transitionStatus: 'mounted' as const,
          },
        ]
      : [],
  );
}

/**
 * Safely parses a JSON string, returning `null` on syntax error without throwing.
 *
 * @template T - Expected parsed type.
 * @param raw - Raw JSON string.
 * @returns Parsed object or `null`.
 */
export function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Applies rehydrated snapshot data into the store via the provided `set` patch callback.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key string type.
 * @param parsed - Raw parsed JSON snapshot.
 * @param set - Zustand store `set` dispatcher.
 * @param dag - Optional PopoverDAG instance to restore.
 * @returns `true` if rehydration succeeded.
 */
export function applyRehydratedState<TData, TContext, TPopoverKey extends string>(
  parsed: unknown,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
  dag?: { clear: () => void; addNode: (key: TPopoverKey, parentKey?: TPopoverKey) => void },
): boolean {
  if (!isRecord(parsed)) return false;

  const rawFloating = parsed.floating ?? parsed.pinned;
  if (!Array.isArray(rawFloating)) return false;

  const nextFloating = parseRehydratedFloatingEntries<TData, TPopoverKey>(rawFloating);
  const activeKeys = new Set<TPopoverKey>(nextFloating.map((e) => e.key));

  const rawOffsets = isRecord(parsed.offsets) ? parsed.offsets : {};
  const rawPinnedStates = isRecord(parsed.pinnedStates) ? parsed.pinnedStates : {};

  const cleanOffsets = sanitizePersistedOffsets<TPopoverKey>(rawOffsets, activeKeys);
  const cleanPinnedStates: Partial<Record<TPopoverKey, boolean>> = {};

  for (const key of activeKeys) {
    const rawVal = rawPinnedStates[key];
    cleanPinnedStates[key] = typeof rawVal === 'boolean' ? rawVal : true;
  }

  const rawZOrder = Array.isArray(parsed.zIndexOrder)
    ? parsed.zIndexOrder.filter(
        (k): k is TPopoverKey => typeof k === 'string' && isSafeKey(k) && isKeyInSet(k, activeKeys),
      )
    : [...activeKeys];

  restoreDAGFromState(dag, [], nextFloating);

  set({
    floating: nextFloating,
    offsets: cleanOffsets,
    pinnedStates: cleanPinnedStates,
    zIndexOrder: rawZOrder,
  });

  return true;
}

/**
 * Executes a state update inside React's `startTransition` if available.
 *
 * @param callback - Transition mutation callback.
 */
export function executeWithTransition(callback: () => void): void {
  if ('startTransition' in React && typeof React.startTransition === 'function') {
    React.startTransition(callback);
  } else {
    callback();
  }
}

/**
 * Rolls back the store state to a previous transaction snapshot.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key string type.
 * @param snapshotState - Target state snapshot.
 * @param snapshotControllers - Active controllers at snapshot time.
 * @param activeControllers - Current map of active controllers.
 * @param popoverDAG - DAG hierarchy manager instance.
 * @param set - Zustand store `set` dispatcher.
 */
export function rollbackTransactionState<TData, TContext, TPopoverKey extends string = string>(
  snapshotState: PopoverStateData<TData, TContext, TPopoverKey>,
  snapshotControllers: Set<string> | null,
  activeControllers: Map<string, AbortController>,
  popoverDAG:
    | { clear: () => void; addNode: (key: TPopoverKey, parentKey?: TPopoverKey) => void }
    | undefined,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
): void {
  rollbackActiveControllers(activeControllers, snapshotControllers);
  restoreDAGFromState(popoverDAG, snapshotState.trail, snapshotState.floating);
  set({
    trail: snapshotState.trail,
    floating: snapshotState.floating,
    offsets: snapshotState.offsets,
    pinnedStates: snapshotState.pinnedStates,
    zIndexOrder: snapshotState.zIndexOrder,
    ownerId: snapshotState.ownerId,
    anchorElement: snapshotState.anchorElement,
    anchorRect: snapshotState.anchorRect,
    nestedHydrationRequestCounters: snapshotState.nestedHydrationRequestCounters,
  });
}
