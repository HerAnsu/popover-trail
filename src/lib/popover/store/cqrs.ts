/**
 * Command Query Responsibility Segregation (CQRS) Dispatcher Wrappers for popover-trail.
 *
 * @module cqrs
 */

import type { StoreApi } from 'zustand/vanilla';
import type {
  PopoverStore,
  PopoverActions,
  PopoverStateData,
  AnchorEventLike,
  OpenRootOptions,
  OpenNestedOptions,
  DefaultDataMap,
  ResolveDataFromMap,
} from '../types';
import type { TrailEntry } from '../types/entryTypes';
import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import { findEntryInStore } from '../utils/storeHelpers';
import {
  selectTopmostEntry,
  selectParentKey,
  selectChildrenKeys,
  selectBreadcrumbs,
  selectPopoverDepth,
  selectTrailBranch,
} from './storeSelectors';
import { DISPOSE_SYMBOL } from '../utils/disposable';

const ZERO_OFFSET = Object.freeze({ x: 0, y: 0 });

function isStoreApi<TStore>(value: unknown): value is StoreApi<TStore> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'getState' in value &&
    typeof value.getState === 'function'
  );
}

/**
 * Query Bus providing read-only, declarative access to popover store state and derived selectors.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key union type.
 * @template TDataMap - Map of keys to specific data payload types.
 */
export class PopoverQueryBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
  TDataMap extends Record<string, unknown> = DefaultDataMap<TPopoverKey, TData>,
> {
  private readonly getStoreState: () => PopoverStateData<TData, TContext, TPopoverKey>;

  constructor(getStoreState: () => PopoverStateData<TData, TContext, TPopoverKey>) {
    this.getStoreState = getStoreState;
  }

  get trail(): readonly TrailEntry<TData, TPopoverKey>[] {
    return this.getStoreState().trail;
  }

  get floating(): readonly TrailEntry<TData, TPopoverKey>[] {
    return this.getStoreState().floating;
  }

  get ownerId(): string | null {
    return this.getStoreState().ownerId;
  }

  get context(): TContext | null {
    return this.getStoreState().context;
  }

  get zIndexOrder(): readonly TPopoverKey[] {
    return this.getStoreState().zIndexOrder;
  }

  get activeCount(): number {
    const s = this.getStoreState();
    return s.trail.length + s.floating.length;
  }

  get isIdle(): boolean {
    const s = this.getStoreState();
    return s.trail.length === 0 && s.floating.length === 0;
  }

  get discriminatedStatus(): 'idle' | 'active-trail' | 'pinned-only' {
    const s = this.getStoreState();
    if (s.trail.length > 0) return 'active-trail';
    if (s.floating.length > 0) return 'pinned-only';
    return 'idle';
  }

  get topmost(): TrailEntry<TData, TPopoverKey> | undefined {
    return selectTopmostEntry(this.getStoreState());
  }

  get root(): TrailEntry<TData, TPopoverKey> | undefined {
    return this.getStoreState().trail[0];
  }

  get snapshot(): {
    trail: readonly TrailEntry<TData, TPopoverKey>[];
    floating: readonly TrailEntry<TData, TPopoverKey>[];
    offsets: Readonly<Partial<Record<TPopoverKey, Readonly<{ x: number; y: number }>>>>;
    pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
    zIndexOrder: readonly TPopoverKey[];
    ownerId: string | null;
  } {
    const s = this.getStoreState();
    return {
      trail: s.trail,
      floating: s.floating,
      offsets: s.offsets,
      pinnedStates: s.pinnedStates,
      zIndexOrder: s.zIndexOrder,
      ownerId: s.ownerId,
    };
  }

  getEntry<K extends TPopoverKey>(
    key: K,
  ): TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, TPopoverKey> | undefined {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key) as
      | TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, TPopoverKey>
      | undefined;
  }

  hasEntry(key: TPopoverKey): boolean {
    const state = this.getStoreState();
    return Boolean(findEntryInStore(state.floating, state.trail, key));
  }

  isOpen(key: TPopoverKey): boolean {
    return this.hasEntry(key);
  }

  isLoading(key: TPopoverKey): boolean {
    const state = this.getStoreState();
    return Boolean(findEntryInStore(state.floating, state.trail, key)?.isLoading);
  }

  getError(key: TPopoverKey): Error | null {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key)?.error ?? null;
  }

  /**
   * Type-safe data accessor that automatically infers exact data payload from TDataMap.
   */
  getData<K extends TPopoverKey>(key: K): ResolveDataFromMap<TDataMap, K, TData> | null {
    const state = this.getStoreState();
    const entry = findEntryInStore(state.floating, state.trail, key);
    return (entry?.data as ResolveDataFromMap<TDataMap, K, TData>) ?? null;
  }

  isPinned(key: TPopoverKey): boolean {
    const states = this.getStoreState().pinnedStates;
    return Object.hasOwn(states, key) ? Boolean(states[key]) : false;
  }

  isTopmost(key: TPopoverKey): boolean {
    const order = this.getStoreState().zIndexOrder;
    return order.length > 0 && order.at(-1) === key;
  }

  getOffset(key: TPopoverKey): { x: number; y: number } {
    return this.getStoreState().offsets[key] ?? ZERO_OFFSET;
  }

  getParent(key: TPopoverKey): TPopoverKey | undefined {
    return selectParentKey<TPopoverKey>(key)(this.getStoreState());
  }

  getChildren(key: TPopoverKey): readonly TPopoverKey[] {
    return selectChildrenKeys<TPopoverKey>(key)(this.getStoreState());
  }

  getBreadcrumbs(key: TPopoverKey): readonly TPopoverKey[] {
    return selectBreadcrumbs<TPopoverKey>(key)(this.getStoreState());
  }

  getBranch(key: TPopoverKey): readonly TrailEntry<TData, TPopoverKey>[] {
    return selectTrailBranch<TData, TPopoverKey>(key)(this.getStoreState());
  }

  getDepth(key: TPopoverKey): number {
    return selectPopoverDepth(key)(this.getStoreState());
  }

  dispose(): void {}

  [DISPOSE_SYMBOL](): void {}
}

/**
 * Command Bus providing imperative dispatch actions for popover lifecycle and history operations.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key union type.
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

  openRoot(ownerId: string, entry: TrailEntry<TData, TPopoverKey>): void {
    this.getActions().openRoot(ownerId, entry);
  }

  openNested(index: number, entry: TrailEntry<TData, TPopoverKey>): void {
    this.getActions().pushNested(index, entry);
  }

  async openRootWithResolver(
    keyOrName: TPopoverKey,
    anchorEvent?: AnchorEventLike,
    options?: Readonly<OpenRootOptions>,
  ): Promise<void> {
    await this.getActions().openRootWithResolver(keyOrName, anchorEvent, options);
  }

  async openNestedWithResolver(
    keyOrName: TPopoverKey,
    sourceKey: TPopoverKey,
    options?: Readonly<OpenNestedOptions>,
  ): Promise<void> {
    await this.getActions().openNestedWithResolver(keyOrName, sourceKey, options);
  }

  close(key: TPopoverKey, options?: { transition?: boolean }): void {
    this.getActions().closeByKey(key, options);
  }

  closeTopmost(options?: { transition?: boolean }): void {
    this.getActions().closeTopmost(options);
  }

  clearTrail(): void {
    this.getActions().clearTrail();
  }

  clearAll(): void {
    this.getActions().closeAll();
  }

  togglePin(key: TPopoverKey, rect?: DOMRect): void {
    this.getActions().togglePin(key, rect);
  }

  bringToFront(key: TPopoverKey): void {
    this.getActions().bringToFront(key);
  }

  updateOffset(key: TPopoverKey, x: number, y: number): void {
    this.getActions().updateOffset(key, x, y);
  }

  async retry(key: TPopoverKey): Promise<void> {
    await this.getActions().retryPopover(key);
  }

  async prefetch(key: TPopoverKey, parentData?: TData): Promise<TData | undefined> {
    return this.getActions().prefetchPopover(key, parentData);
  }

  async invalidate(keyOrKeys: TPopoverKey | readonly TPopoverKey[]): Promise<void> {
    await this.getActions().invalidate(keyOrKeys);
  }

  subscribeKey(
    key: TPopoverKey,
    listener: (
      entry: TrailEntry<TData, TPopoverKey> | undefined,
      prevEntry: TrailEntry<TData, TPopoverKey> | undefined,
    ) => void,
  ): () => void {
    return this.getActions().subscribeKey(key, listener);
  }

  undo(): void {
    this.getActions().undo();
  }

  redo(): void {
    this.getActions().redo();
  }

  batch(fn: (bus: PopoverCommandBus<TData, TContext, TPopoverKey>) => void): void {
    this.getActions().batchUpdates(() => {
      fn(this);
    });
  }

  transition(fn: (bus: PopoverCommandBus<TData, TContext, TPopoverKey>) => void): void {
    this.getActions().runTransition(() => {
      fn(this);
    });
  }

  dispose(): void {
    this.clearAll();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}

/**
 * Creates paired Query and Command buses for CQRS architecture over a popover store.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key union type.
 * @template TDataMap - Map of keys to specific data payload types.
 * @param storeOrApi - PopoverStore instance, Zustand StoreApi, or getter function.
 * @returns Object with `{ queryBus, commandBus }`.
 *
 * @example
 * ```typescript
 * const { queryBus, commandBus } = createCQRSBuses(store);
 * console.log(queryBus.isOpen('user'));
 * commandBus.close('user');
 * ```
 */
export function createCQRSBuses<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TDataMap extends Record<string, unknown> = Record<string, never>,
>(
  storeOrApi:
    | PopoverStore<TData, TContext, TPopoverKey>
    | StoreApi<PopoverStore<TData, TContext, TPopoverKey>>
    | (() => PopoverStore<TData, TContext, TPopoverKey>),
): {
  queryBus: PopoverQueryBus<TData, TContext, TPopoverKey, TDataMap>;
  commandBus: PopoverCommandBus<TData, TContext, TPopoverKey>;
} {
  const getState = (): PopoverStore<TData, TContext, TPopoverKey> => {
    if (typeof storeOrApi === 'function') {
      return storeOrApi();
    }
    if (isStoreApi<PopoverStore<TData, TContext, TPopoverKey>>(storeOrApi)) {
      return storeOrApi.getState();
    }
    return storeOrApi;
  };

  const getActions = (): PopoverActions<TData, TContext, TPopoverKey> => getState().actions;

  return {
    queryBus: new PopoverQueryBus<TData, TContext, TPopoverKey, TDataMap>(getState),
    commandBus: new PopoverCommandBus<TData, TContext, TPopoverKey>(getActions),
  };
}
