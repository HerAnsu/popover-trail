/**
 * Command Side Bus for CQRS Architecture in popover-trail.
 *
 * @module cqrsCommandBus
 */

import type {
  TrailEntry,
  AnchorEventLike,
  OpenRootOptions,
  OpenNestedOptions,
  PopoverActions,
  PopoverStateData,
} from '../../types';
import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import {
  type CommandBusTarget,
  resolveCommandActions,
} from './cqrsCommandTarget';

export type { CommandBusTarget };

export class PopoverCommandBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
> {
  private readonly getActions: () => PopoverActions<TData, TContext, TPopoverKey>;

  constructor(target: CommandBusTarget<TData, TContext, TPopoverKey>) {
    this.getActions = () => resolveCommandActions<TData, TContext, TPopoverKey>(target);
  }

  openRoot(ownerId: string, entry: TrailEntry<TData, TPopoverKey>): void {
    this.getActions().openRoot(ownerId, entry);
  }
  openNested(i: number, e: TrailEntry<TData, TPopoverKey>): void { this.getActions().pushNested(i, e); }
  pushNested(i: number, e: TrailEntry<TData, TPopoverKey>): void { this.getActions().pushNested(i, e); }
  async openRootWithResolver(
    key: TPopoverKey,
    anchor?: AnchorEventLike,
    options?: OpenRootOptions,
  ): Promise<void> {
    await this.getActions().openRootWithResolver(key, anchor, options);
  }
  async openNestedWithResolver(
    parent: TPopoverKey,
    key: TPopoverKey,
    options?: OpenNestedOptions,
  ): Promise<void> {
    await this.getActions().openNestedWithResolver(parent, key, options);
  }
  close(k: TPopoverKey, opts?: { transition?: boolean }): void { this.getActions().closeByKey(k, opts); }
  closeByKey(k: TPopoverKey, opts?: { transition?: boolean }): void {
    this.getActions().closeByKey(k, opts);
  }
  closeTopmost(opts?: { transition?: boolean }): void { this.getActions().closeTopmost(opts); }
  clearTrail(opts?: { transition?: boolean }): void { this.getActions().clearTrail(opts); }
  clearAll(): void { this.getActions().closeAll(); }
  clear(): void { this.getActions().clear(); }
  togglePin(key: TPopoverKey, rect?: DOMRect): void { this.getActions().togglePin(key, rect); }
  bringToFront(key: TPopoverKey): void { this.getActions().bringToFront(key); }
  updateOffset(key: TPopoverKey, x: number, y: number): void {
    this.getActions().updateOffset(key, x, y);
  }
  async retry(key: TPopoverKey, options?: Readonly<{ forceRefresh?: boolean }>): Promise<void> {
    await (options !== undefined
      ? this.getActions().retryPopover(key, options)
      : this.getActions().retryPopover(key));
  }
  async prefetch(key: TPopoverKey, parentData?: TData): Promise<TData | undefined> {
    return this.getActions().prefetchPopover(key, parentData);
  }
  updateConfig(patch: Partial<PopoverStateData<TData, TContext, TPopoverKey>>): void {
    this.getActions().updateConfig(patch);
  }
  undo(): void { this.getActions().undo(); }
  redo(): void { this.getActions().redo(); }
  batch(fn: (bus: PopoverCommandBus<TData, TContext, TPopoverKey>) => void): void {
    const act = this.getActions();
    if (act.batchUpdates) act.batchUpdates(() => fn(this));
    else fn(this);
  }
  dispose(): void { this.getActions().destroy?.(); }
  [DISPOSE_SYMBOL](): void { this.dispose(); }
  [Symbol.dispose](): void { this.dispose(); }
}
