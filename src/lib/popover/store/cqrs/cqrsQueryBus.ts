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

const ZERO_OFFSET: DragOffset = Object.freeze({ x: 0, y: 0 });

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
  get root(): TrailEntry<TData, TPopoverKey> | undefined {
    return this.getStoreState().trail[0];
  }
  get zIndexOrder(): readonly TPopoverKey[] {
    return this.getStoreState().zIndexOrder;
  }
  get topmost(): TrailEntry<TData, TPopoverKey> | undefined {
    return selectTopmostEntry<TData, TPopoverKey>(this.getStoreState());
  }
  get totalCount(): number {
    return selectTotalActiveCount(this.getStoreState());
  }
  get activeCount(): number {
    return this.totalCount;
  }
  get isIdle(): boolean {
    return selectIsIdle(this.getStoreState());
  }
  get ownerId(): string | null {
    return this.getStoreState().ownerId;
  }
  get context(): TContext | null {
    return this.getStoreState().context;
  }
  get snapshot(): HistorySnapshot<TData, TPopoverKey> {
    return createHistorySnapshot(this.getStoreState());
  }
  get status(): 'idle' | 'active-trail' | 'pinned-only' {
    return selectDiscriminatedStatus(this.getStoreState());
  }
  get discriminatedStatus(): 'idle' | 'active-trail' | 'pinned-only' {
    return this.status;
  }

  public getEntry<K extends TPopoverKey>(
    key: K,
  ): TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, K> | undefined {
    const { floating, trail } = this.getStoreState();
    return findEntryInStore(floating, trail, key) as
      | TrailEntry<ResolveDataFromMap<TDataMap, K, TData>, K>
      | undefined;
  }

  public getData<K extends TPopoverKey>(
    key: K,
  ): ResolveDataFromMap<TDataMap, K, TData> | null | undefined {
    return this.getEntry(key)?.data ?? null;
  }

  public getOffset(key: TPopoverKey): DragOffset {
    return this.getStoreState().offsets[key] ?? ZERO_OFFSET;
  }

  public isOpen(key: TPopoverKey): boolean {
    const { floating, trail } = this.getStoreState();
    return floating.some((e) => e.key === key) || trail.some((e) => e.key === key);
  }

  public hasEntry(key: TPopoverKey): boolean {
    return this.isOpen(key);
  }
  public isPinned(key: TPopoverKey): boolean {
    return Boolean(this.getStoreState().pinnedStates[key]);
  }
  public isTopmost(key: TPopoverKey): boolean {
    const { zIndexOrder } = this.getStoreState();
    return zIndexOrder.length > 0 && zIndexOrder.at(-1) === key;
  }
  public isLoading(key: TPopoverKey): boolean {
    return this.getEntry(key)?.isLoading ?? false;
  }
  public getError(key: TPopoverKey): Error | null {
    return this.getEntry(key)?.error ?? null;
  }
  public getParent(key: TPopoverKey): TPopoverKey | undefined {
    return selectParentKey<TPopoverKey>(key)(this.getStoreState());
  }
  public getChildren(key: TPopoverKey): readonly TPopoverKey[] {
    return selectChildrenKeys<TPopoverKey, TData>(key)(this.getStoreState());
  }
  public getBreadcrumbs(key: TPopoverKey): readonly TPopoverKey[] {
    return selectBreadcrumbs<TPopoverKey, TData>(key)(this.getStoreState());
  }
  public getDepth(key: TPopoverKey): number {
    return selectPopoverDepth<TPopoverKey>(key)(this.getStoreState());
  }
  public getBranch(key: TPopoverKey): readonly TrailEntry<TData, TPopoverKey>[] {
    return selectTrailBranch<TPopoverKey, TData>(key)(this.getStoreState());
  }

  public dispose(): void {}
  public [DISPOSE_SYMBOL](): void {}
  public [Symbol.dispose](): void {}
}
