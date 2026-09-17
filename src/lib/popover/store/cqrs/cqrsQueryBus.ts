/**
 * Query Side Bus for CQRS Architecture in popover-trail.
 *
 * @module cqrsQueryBus
 */

import type { PopoverStateData, DefaultDataMap, ResolveDataFromMap, DragOffset } from '../../types';
import type { TrailEntry } from '../../types/entryTypes';
import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';
import { findEntryInStore } from '../../utils/storeHelpers';
import {
  selectTopmostEntry,
  selectParentKey,
  selectChildrenKeys,
  selectBreadcrumbs,
  selectPopoverDepth,
  selectTrailBranch,
  selectTotalActiveCount,
  selectIsIdle,
  selectDiscriminatedStatus,
} from '../selectors/storeSelectors';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { createHistorySnapshot, type HistorySnapshot } from '../history/history';
import { Ok, Err, type Result, mapResult } from '../../utils/result';
import { ZERO_OFFSET } from '../../constants';
import { first, last } from '../../utils/arrayUtils';
import { isPopoverActive } from '../../utils/predicates';

/**
 * Diagnostic error payload returned when a query operation targets a nonexistent or closed popover.
 *
 * @template K - Popover key type.
 */
export interface PopoverNotFoundError<K extends string = string> {
  readonly type: 'popover_not_found';
  /** Popover identifier that was not found. */
  readonly key: K;
  /** Explanatory message. */
  readonly message: string;
}

/**
 * Read-only query bus for inspecting popover store state.
 *
 * @remarks
 * Separates reads from writes (CQRS). All methods and getters inspect immutable
 * state snapshots and never mutate the store or trigger re-renders.
 *
 * @template TData - Default popover payload data.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @template TDataMap - Type registry mapping specific keys to specific data types.
 */
export class PopoverQueryBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
  TDataMap extends Record<string, unknown> = DefaultDataMap<TPopoverKey, TData>,
> {
  private readonly getStoreState: () => PopoverStateData<TData, TContext, TPopoverKey>;

  /**
   * Initializes the query bus with an immutable state snapshot accessor.
   *
   * @param getStoreState - Thunk returning the current immutable store snapshot.
   */
  constructor(getStoreState: () => PopoverStateData<TData, TContext, TPopoverKey>) {
    this.getStoreState = getStoreState;
  }

  /** Active cascading trail entries in root-to-leaf order. */
  get trail(): readonly TrailEntry<TData, TPopoverKey>[] {
    return this.getStoreState().trail;
  }
  /** Pinned/floating entries detached from the active trail. */
  get floating(): readonly TrailEntry<TData, TPopoverKey>[] {
    return this.getStoreState().floating;
  }
  /** Root popover entry anchoring the active cascading trail. */
  get root(): TrailEntry<TData, TPopoverKey> | undefined {
    return first(this.getStoreState().trail);
  }
  /** Z-index stacking sequence of active popover keys. */
  get zIndexOrder(): readonly TPopoverKey[] {
    return this.getStoreState().zIndexOrder;
  }
  /** Topmost focused popover entry in visual and keyboard order. */
  get topmost(): TrailEntry<TData, TPopoverKey> | undefined {
    return selectTopmostEntry<TData, TPopoverKey>(this.getStoreState());
  }
  /** Total count of all open popovers (trail + floating). */
  get totalCount(): number {
    return selectTotalActiveCount(this.getStoreState());
  }
  /** `true` if no popovers are currently open. */
  get isIdle(): boolean {
    return selectIsIdle(this.getStoreState());
  }
  /** Identifier of the current trail session owner. */
  get ownerId(): string | null {
    return this.getStoreState().ownerId;
  }
  /** Injected shared context object. */
  get context(): TContext | null {
    return this.getStoreState().context;
  }
  /** Immutable snapshot of current state suitable for history journaling. */
  get snapshot(): HistorySnapshot<TData, TPopoverKey> {
    return createHistorySnapshot(this.getStoreState());
  }
  /** Discrete operational state: `'idle' | 'active-trail' | 'pinned-only'`. */
  get status(): 'idle' | 'active-trail' | 'pinned-only' {
    return selectDiscriminatedStatus(this.getStoreState());
  }

  /**
   * Retrieves the trail entry for a given key, with strongly-typed payload resolution.
   *
   * @param key - Registered popover key.
   * @returns TrailEntry if found, otherwise `undefined`.
   */
  public getEntry<K extends TPopoverKey>(
    key: K,
  ): TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, K> | undefined {
    const { floating, trail } = this.getStoreState();
    return findEntryInStore(floating, trail, key) as
      | TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, K>
      | undefined;
  }

  /**
   * Retrieves the trail entry for a given key returning a `Result`.
   *
   * @remarks
   * Eliminates the need for null-checks or throw-catch blocks by returning an explicit `Ok(entry)`
   * or `Err(PopoverNotFoundError)` structure.
   *
   * @example
   * ```ts
   * const entryResult = queryBus.getEntryResult('userProfile');
   * if (isOk(entryResult)) {
   *   console.log('User data:', entryResult.value.data);
   * }
   * ```
   *
   * @param key - Target popover key.
   * @returns `Ok(TrailEntry)` or `Err(PopoverNotFoundError)`.
   */
  public getEntryResult<K extends TPopoverKey>(
    key: K,
  ): Result<TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, K>, PopoverNotFoundError<K>> {
    const entry = this.getEntry(key);
    if (!entry) {
      return Err({
        type: 'popover_not_found',
        key,
        message: `Popover entry with key "${key}" not found in active trail or floating stack.`,
      });
    }
    return Ok(entry);
  }

  /**
   * Retrieves the resolved data payload for a given popover key.
   */
  public getData<K extends TPopoverKey>(
    key: K,
  ): ResolveDataFromMap<TDataMap, K, TData> | null | undefined {
    return this.getEntry(key)?.data ?? null;
  }

  /**
   * Retrieves the resolved data payload for a given popover key returning a `Result`.
   *
   * @param key - Target popover key.
   * @returns `Ok(data)` or `Err(PopoverNotFoundError)`.
   */
  public getDataResult<K extends TPopoverKey>(
    key: K,
  ): Result<ResolveDataFromMap<TDataMap, K, TData> | null, PopoverNotFoundError<K>> {
    return mapResult(this.getEntryResult(key), (entry) => entry.data ?? null);
  }

  /**
   * Retrieves the current drag/docking coordinate offset for the given popover key.
   *
   * @param key - Registered popover key.
   * @returns Drag offset { x, y } in pixels, or { x: 0, y: 0 } if unset.
   */
  public getOffset(key: TPopoverKey): DragOffset {
    return this.getStoreState().offsets[key] ?? ZERO_OFFSET;
  }

  /**
   * Checks whether a popover is currently open (in active trail or floating stack).
   *
   * @param key - Registered popover key.
   * @returns `true` if active, `false` otherwise.
   */
  public isOpen(key: TPopoverKey): boolean {
    return isPopoverActive(this.getStoreState(), key);
  }

  /**
   * Checks whether a popover is pinned into floating mode.
   *
   * @param key - Registered popover key.
   * @returns `true` if pinned, `false` otherwise.
   */
  public isPinned(key: TPopoverKey): boolean {
    return Boolean(this.getStoreState().pinnedStates[key]);
  }

  /**
   * Checks whether the popover is the topmost entry in stacking and focus order.
   *
   * @param key - Registered popover key.
   * @returns `true` if on top, `false` otherwise.
   */
  public isTopmost(key: TPopoverKey): boolean {
    return last(this.getStoreState().zIndexOrder) === key;
  }

  /**
   * Checks whether an async data resolver is currently loading for the given popover.
   *
   * @param key - Registered popover key.
   * @returns `true` if loading, `false` otherwise.
   */
  public isLoading(key: TPopoverKey): boolean {
    return this.getEntry(key)?.isLoading ?? false;
  }

  /**
   * Retrieves the error object if the popover's async resolver failed.
   *
   * @param key - Registered popover key.
   * @returns Error instance if failed, or `null` otherwise.
   */
  public getError(key: TPopoverKey): Error | null {
    return this.getEntry(key)?.error ?? null;
  }

  /**
   * Retrieves the parent popover key in the active cascade hierarchy.
   *
   * @param key - Target popover key.
   * @returns Parent key or `undefined` if root or not found.
   */
  public getParent(key: TPopoverKey): TPopoverKey | undefined {
    return selectParentKey<TPopoverKey>(key)(this.getStoreState());
  }

  /**
   * Retrieves keys of all child popovers opened directly by the specified popover.
   *
   * @param key - Parent popover key.
   * @returns Readonly array of child keys.
   */
  public getChildren(key: TPopoverKey): readonly TPopoverKey[] {
    return selectChildrenKeys<TPopoverKey, TData>(key)(this.getStoreState());
  }

  /**
   * Retrieves the breadcrumb trail keys leading from root down to the specified popover.
   *
   * @param key - Target popover key.
   * @returns Array of keys in root-to-target order.
   */
  public getBreadcrumbs(key: TPopoverKey): readonly TPopoverKey[] {
    return selectBreadcrumbs<TPopoverKey, TData>(key)(this.getStoreState());
  }

  /**
   * Retrieves the zero-indexed cascade nesting depth of the specified popover (0 = root).
   *
   * @param key - Target popover key.
   * @returns Integer depth tier, or -1 if popover is not in the active trail.
   */
  public getDepth(key: TPopoverKey): number {
    return selectPopoverDepth<TPopoverKey>(key)(this.getStoreState());
  }

  /**
   * Retrieves the cascade trail branch entries leading from root down to the specified popover.
   *
   * @param key - Target popover key.
   * @returns Array of TrailEntry objects along the branch.
   */
  public getBranch(key: TPopoverKey): readonly TrailEntry<TData, TPopoverKey>[] {
    return selectTrailBranch<TPopoverKey, TData>(key)(this.getStoreState());
  }

  public dispose(): void {}
  public [DISPOSE_SYMBOL](): void {}
  public [Symbol.dispose](): void {}
}
