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
 * Read-Only Query Bus wrapping PopoverStore. Guaranteed 100% side-effect-free reads.
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

  get trail(): readonly TrailEntry<TData>[] {
    return this.getStoreState().trail;
  }

  get floating(): readonly TrailEntry<TData>[] {
    return this.getStoreState().floating;
  }

  get ownerId(): string | null {
    return this.getStoreState().ownerId;
  }

  get context(): TContext | null {
    return this.getStoreState().context;
  }

  get zIndexOrder(): readonly string[] {
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

  get topmost(): TrailEntry<TData> | undefined {
    return selectTopmostEntry(this.getStoreState());
  }

  get root(): TrailEntry<TData> | undefined {
    return this.getStoreState().trail[0];
  }

  getEntry(key: TPopoverKey): TrailEntry<TData> | undefined {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key);
  }

  hasEntry(key: TPopoverKey): boolean {
    const state = this.getStoreState();
    return Boolean(findEntryInStore(state.floating, state.trail, key));
  }

  isLoading(key: TPopoverKey): boolean {
    const state = this.getStoreState();
    return Boolean(findEntryInStore(state.floating, state.trail, key)?.isLoading);
  }

  getError(key: TPopoverKey): Error | null {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key)?.error ?? null;
  }

  getData(key: TPopoverKey): TData | null {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key)?.data ?? null;
  }

  isPinned(key: TPopoverKey): boolean {
    const states = this.getStoreState().pinnedStates;
    return typeof key === 'string' && Object.prototype.hasOwnProperty.call(states, key)
      ? Boolean(states[key])
      : false;
  }

  getOffset(key: TPopoverKey): { x: number; y: number } {
    return this.getStoreState().offsets[key] ?? ZERO_OFFSET;
  }
}

/**
 * Side-Effecting Command Bus wrapping PopoverActions dispatchers.
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

  openRoot(ownerId: string, entry: TrailEntry<TData>): void {
    this.getActions().openRoot(ownerId, entry);
  }

  openNested(index: number, entry: TrailEntry<TData>): void {
    this.getActions().pushNested(index, entry);
  }

  close(key: TPopoverKey): void {
    this.getActions().closeByKey(key);
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

  undo(): void {
    this.getActions().undo();
  }

  redo(): void {
    this.getActions().redo();
  }

  dispose(): void {
    this.clearAll();
  }
}

/**
 * Factory creating CQRS QueryBus and CommandBus instances for a popover store instance.
 * Supports passing a static PopoverStore, StoreApi, or a dynamic getState getter function.
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
