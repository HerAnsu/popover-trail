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
import { err, type Result } from '../../utils/result';
import { type CommandBusTarget, resolveCommandActions } from './cqrsCommandTarget';

export type { CommandBusTarget };

/**
 * Command bus for dispatching popover state mutations.
 *
 * @remarks
 * Encapsulates all state-changing actions—such as opening, closing, pinning,
 * or dragging popovers—keeping mutation logic separated from state queries.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string keys.
 */
export class PopoverCommandBus<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
> {
  private readonly getActions: () => PopoverActions<TData, TContext, TPopoverKey>;

  /**
   * Initializes the command bus pointing to a store instance or action resolver.
   */
  constructor(target: CommandBusTarget<TData, TContext, TPopoverKey>) {
    this.getActions = () => resolveCommandActions<TData, TContext, TPopoverKey>(target);
  }

  /** Opens or replaces the root popover anchor card. */
  openRoot(ownerId: string, entry: TrailEntry<TData, TPopoverKey>): void {
    this.getActions().openRoot(ownerId, entry);
  }
  /** Pushes a nested child popover card at a specific cascade depth tier. */
  openNested(i: number, e: TrailEntry<TData, TPopoverKey>): void {
    this.getActions().pushNested(i, e);
  }
  /** Alias for `openNested`. */
  pushNested(i: number, e: TrailEntry<TData, TPopoverKey>): void {
    this.getActions().pushNested(i, e);
  }

  /** Opens root popover card resolving payload asynchronously via registered data resolver. */
  async openRootWithResolver(
    key: TPopoverKey,
    anchor?: AnchorEventLike,
    options?: OpenRootOptions,
  ): Promise<void> {
    await this.getActions().openRootWithResolver(key, anchor, options);
  }

  /** Opens child popover resolving payload asynchronously. */
  async openNestedWithResolver(
    parent: TPopoverKey,
    key: TPopoverKey,
    options?: OpenNestedOptions,
  ): Promise<void> {
    await this.getActions().openNestedWithResolver(parent, key, options);
  }

  /** Closes a specific popover and automatically tears down its reachable descendant subgraph. */
  close(k: TPopoverKey, opts?: { transition?: boolean }): void {
    this.getActions().closeByKey(k, opts);
  }
  /** Closes a popover by key with optional exit transition scheduling. */
  closeByKey(k: TPopoverKey, opts?: { transition?: boolean }): void {
    this.getActions().closeByKey(k, opts);
  }
  /** Dismisses the topmost focused popover. */
  closeTopmost(opts?: { transition?: boolean }): void {
    this.getActions().closeTopmost(opts);
  }
  /** Closes all active trail popovers, leaving pinned floating cards intact. */
  clearTrail(opts?: { transition?: boolean }): void {
    this.getActions().clearTrail(opts);
  }
  /** Closes all active popovers (both trail and pinned floating cards). */
  clearAll(): void {
    this.getActions().closeAll();
  }
  /** Purges all popovers and resets store to initial blank state. */
  clear(): void {
    this.getActions().clear();
  }
  /** Pins or unpins a popover, transitioning between trail cascade and floating modes. */
  togglePin(key: TPopoverKey, rect?: DOMRect): void {
    this.getActions().togglePin(key, rect);
  }
  /** Elevates a popover to the top of visual stacking and focus order. */
  bringToFront(key: TPopoverKey): void {
    this.getActions().bringToFront(key);
  }
  /** Updates custom drag/docking coordinate offset. */
  updateOffset(key: TPopoverKey, x: number, y: number): void {
    this.getActions().updateOffset(key, x, y);
  }
  /** Re-executes the async resolver for a failed popover entry. */
  async retry(key: TPopoverKey, options?: Readonly<{ forceRefresh?: boolean }>): Promise<void> {
    await (options !== undefined
      ? this.getActions().retryPopover(key, options)
      : this.getActions().retryPopover(key));
  }
  /** Warm-up prefetch for a popover key ahead of user hover/interaction. */
  async prefetch(key: TPopoverKey, parentData?: TData): Promise<TData | undefined> {
    return this.getActions().prefetchPopover(key, parentData);
  }
  /** Updates global store configuration settings. */
  updateConfig(patch: Partial<PopoverStateData<TData, TContext, TPopoverKey>>): void {
    this.getActions().updateConfig(patch);
  }
  /** Restores previous state snapshot from undo journal ring buffer. */
  undo(): void {
    this.getActions().undo();
  }
  /** Re-applies subsequent state snapshot from redo journal ring buffer. */
  redo(): void {
    this.getActions().redo();
  }

  /**
   * Batches multiple commands together so subscribers only receive a single update.
   *
   * @param fn - Batch callback receiving this command bus.
   */
  batch(fn: (bus: PopoverCommandBus<TData, TContext, TPopoverKey>) => void): void {
    const act = this.getActions();
    if (act.batchUpdates) act.batchUpdates(() => fn(this));
    else fn(this);
  }

  /**
   * Runs a batch of commands and returns a `Result`.
   *
   * @template R - Return value type.
   * @template E - Error payload type.
   * @param fn - Transaction body returning `Result<R, E>`.
   * @returns `Result<R, E>`.
   */
  batchResult<R, E = Error>(
    fn: (bus: PopoverCommandBus<TData, TContext, TPopoverKey>) => Result<R, E>,
  ): Result<R, E> {
    let result: Result<R, E> | undefined;
    this.batch(() => {
      result = fn(this);
    });
    return result ?? err(new Error('Batch execution did not produce a result.') as unknown as E);
  }

  /** Releases store resources and detaches listeners. */
  dispose(): void {
    this.getActions().destroy?.();
  }
  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
  [Symbol.dispose](): void {
    this.dispose();
  }
}
