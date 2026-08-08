/**
 * Command Query Responsibility Segregation (CQRS) Dispatcher Wrappers for popover-trail.
 * Explicitly separates read-only Query Selectors from state-mutating Command Dispatchers.
 *
 * @module cqrs
 */

import type { PopoverStore, PopoverActions, PopoverStateData } from '../types/storeTypes';
import type { TrailEntry } from '../types/entryTypes';
import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import { findEntryInStore } from '../utils/storeHelpers';

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

  getEntry(key: TPopoverKey): TrailEntry<TData> | undefined {
    const state = this.getStoreState();
    return findEntryInStore(state.floating, state.trail, key);
  }

  isPinned(key: TPopoverKey): boolean {
    return Boolean(this.getStoreState().pinnedStates[key]);
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
  private readonly actions: PopoverActions<TData, TContext, TPopoverKey>;

  constructor(actions: PopoverActions<TData, TContext, TPopoverKey>) {
    this.actions = actions;
  }

  close(key: TPopoverKey): void {
    this.actions.closeByKey(key);
  }

  clearAll(): void {
    this.actions.closeAll();
  }

  togglePin(key: TPopoverKey, rect?: DOMRect): void {
    this.actions.togglePin(key, rect);
  }

  bringToFront(key: TPopoverKey): void {
    this.actions.bringToFront(key);
  }

  updateOffset(key: TPopoverKey, x: number, y: number): void {
    this.actions.updateOffset(key, x, y);
  }

  dispose(): void {
    this.clearAll();
  }
}

/**
 * Factory creating CQRS QueryBus and CommandBus instances for a popover store instance.
 */
export function createCQRSBuses<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(
  store: PopoverStore<TData, TContext, TPopoverKey>,
): {
  queryBus: PopoverQueryBus<TData, TContext, TPopoverKey>;
  commandBus: PopoverCommandBus<TData, TContext, TPopoverKey>;
} {
  return {
    queryBus: new PopoverQueryBus(() => store),
    commandBus: new PopoverCommandBus(store.actions),
  };
}
