/**
 * Command Query Responsibility Segregation (CQRS) Dispatcher Wrappers for popover-trail.
 * Explicitly separates read-only Query Selectors from state-mutating Command Dispatchers.
 *
 * @module cqrs
 */

import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, PopoverActions, PopoverStateData } from '../types/storeTypes';
import type { TrailEntry } from '../types/entryTypes';
import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import { findEntryInStore } from '../utils/storeHelpers';
import { selectTopmostEntry } from './storeSelectors';

const ZERO_OFFSET = Object.freeze({ x: 0, y: 0 });

/**
 * Read-Only Query Bus wrapping PopoverStore.
 * Provides guaranteed 100% side-effect-free state queries, getters, and computed metrics.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export class PopoverQueryBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
> {
  private readonly getStoreState: () => PopoverStateData<TData, TContext>;

  constructor(getStoreState: () => PopoverStateData<TData, TContext>) {
    this.getStoreState = getStoreState;
  }

  /** Read-only active trailing cascade cards array. */
  get trail(): readonly TrailEntry<TData>[] {
    return this.getStoreState().trail;
  }

  /** Read-only pinned floating window cards array. */
  get floating(): readonly TrailEntry<TData>[] {
    return this.getStoreState().floating;
  }

  /** Unique owner trigger identifier for the active root trail. */
  get ownerId(): string | null {
    return this.getStoreState().ownerId;
  }

  /** Global shared context object. */
  get context(): TContext | null {
    return this.getStoreState().context;
  }

  /** Topological z-index stacking key order array. */
  get zIndexOrder(): readonly string[] {
    return this.getStoreState().zIndexOrder;
  }

  /** Total count of all currently active (trailing + floating) popovers. */
  get activeCount(): number {
    const s = this.getStoreState();
    return s.trail.length + s.floating.length;
  }

  /** True if no popover cards are currently active. */
  get isIdle(): boolean {
    const s = this.getStoreState();
    return s.trail.length === 0 && s.floating.length === 0;
  }

  /** Discriminated high-level status of the store. */
  get discriminatedStatus(): 'idle' | 'active-trail' | 'pinned-only' {
    const s = this.getStoreState();
    if (s.trail.length > 0) return 'active-trail';
    if (s.floating.length > 0) return 'pinned-only';
    return 'idle';
  }

  /** Topmost active card in the stacking order. */
  get topmost(): TrailEntry<TData> | undefined {
    return selectTopmostEntry(this.getStoreState());
  }

  /** Root card that initiated the active cascade trail. */
  get root(): TrailEntry<TData> | undefined {
    return this.getStoreState().trail[0];
  }

  /** Retrieves a specific trail entry by key if active. */
  getEntry(key: TPopoverKey): TrailEntry<TData> | undefined {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key);
  }

  /** Returns true if a specific popover key is currently open. */
  hasEntry(key: TPopoverKey): boolean {
    const state = this.getStoreState();
    return Boolean(findEntryInStore(state.floating, state.trail, key));
  }

  /** Returns true if a specific popover is currently resolving async data. */
  isLoading(key: TPopoverKey): boolean {
    const state = this.getStoreState();
    return Boolean(findEntryInStore(state.floating, state.trail, key)?.isLoading);
  }

  /** Returns the resolution Error object for a key, or null if healthy. */
  getError(key: TPopoverKey): Error | null {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key)?.error ?? null;
  }

  /** Returns the resolved data payload for a key, or null if not yet resolved. */
  getData(key: TPopoverKey): TData | null {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key)?.data ?? null;
  }

  /** Returns true if a specific popover is detached as a pinned floating window. */
  isPinned(key: TPopoverKey): boolean {
    const states = this.getStoreState().pinnedStates;
    return typeof key === 'string' && Object.hasOwn(states, key) ? Boolean(states[key]) : false;
  }

  /** Returns current drag offset coordinates { x, y } in pixels for a given key. */
  getOffset(key: TPopoverKey): { x: number; y: number } {
    return this.getStoreState().offsets[key] ?? ZERO_OFFSET;
  }
}

/**
 * Side-Effecting Command Bus wrapping PopoverActions dispatchers.
 * Dispatches state-mutating actions (open, close, pin, drag, undo/redo).
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export class PopoverCommandBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
> {
  private readonly getActions: () => PopoverActions<TData, TContext, TPopoverKey>;

  constructor(
    actionsOrGetter:
      | PopoverActions<TData, TContext, TPopoverKey>
      | (() => PopoverActions<TData, TContext, TPopoverKey>),
  ) {
    this.getActions =
      typeof actionsOrGetter === 'function' ? actionsOrGetter : () => actionsOrGetter;
  }

  /** Opens a new root popover card. */
  openRoot(ownerId: string, entry: TrailEntry<TData>): void {
    this.getActions().openRoot(ownerId, entry);
  }

  /** Pushes a nested child popover card onto the active trail. */
  openNested(index: number, entry: TrailEntry<TData>): void {
    this.getActions().pushNested(index, entry);
  }

  /** Closes a popover card by key along with its descendant subtree. */
  close(key: TPopoverKey): void {
    this.getActions().closeByKey(key);
  }

  /** Closes all open popovers (both trailing and pinned). */
  clearAll(): void {
    this.getActions().closeAll();
  }

  /** Toggles a card between trailing stack and pinned floating window. */
  togglePin(key: TPopoverKey, rect?: DOMRect): void {
    this.getActions().togglePin(key, rect);
  }

  /** Elevates a card to the highest visual layer in the stacking order. */
  bringToFront(key: TPopoverKey): void {
    this.getActions().bringToFront(key);
  }

  /** Updates the persistent drag translation coordinates for a card. */
  updateOffset(key: TPopoverKey, x: number, y: number): void {
    this.getActions().updateOffset(key, x, y);
  }

  /** Reverts to the previous recorded history snapshot. */
  undo(): void {
    this.getActions().undo();
  }

  /** Re-applies the next recorded history snapshot. */
  redo(): void {
    this.getActions().redo();
  }

  /** Clears all cards and resets the bus. */
  dispose(): void {
    this.clearAll();
  }
}

/**
 * Factory creating paired CQRS QueryBus and CommandBus instances for a popover store instance.
 *
 * @remarks
 * Decouples read queries from write mutations. Ideal for domain services, telemetry monitors,
 * or background orchestration scripts that should not accidentally trigger store updates.
 *
 * @example
 * ```typescript
 * const { queryBus, commandBus } = createCQRSBuses(store);
 *
 * // Read-only query
 * console.log('Active count:', queryBus.activeCount);
 * console.log('Is idle:', queryBus.isIdle);
 *
 * // Command dispatch
 * commandBus.close('user-card');
 * ```
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param storeOrApi - Store instance, StoreApi, or dynamic getState accessor function.
 * @returns Object containing `queryBus` and `commandBus`.
 */
export function createCQRSBuses<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(
  storeOrApi:
    | PopoverStore<TData, TContext, TPopoverKey>
    | StoreApi<PopoverStore<TData, TContext, TPopoverKey>>
    | (() => PopoverStore<TData, TContext, TPopoverKey>),
): {
  queryBus: PopoverQueryBus<TData, TContext, TPopoverKey>;
  commandBus: PopoverCommandBus<TData, TContext, TPopoverKey>;
} {
  const getState = (): PopoverStore<TData, TContext, TPopoverKey> => {
    if (typeof storeOrApi === 'function') {
      return storeOrApi();
    }
    if ('getState' in storeOrApi && typeof storeOrApi.getState === 'function') {
      return storeOrApi.getState();
    }
    return storeOrApi as PopoverStore<TData, TContext, TPopoverKey>;
  };

  const getActions = (): PopoverActions<TData, TContext, TPopoverKey> => getState().actions;

  return {
    queryBus: new PopoverQueryBus(getState),
    commandBus: new PopoverCommandBus(getActions),
  };
}
