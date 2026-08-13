/**
 * Imperative Store Controller Engine for popover-trail.
 * Enables controlling popover cards imperatively outside React component trees.
 *
 * @module popoverController
 */

import type { StoreApi } from 'zustand';
import type { PopoverStore, TrailEntry } from '../types';
import { validateStoreControllerInstance } from './devWarnings';

/**
 * Controller interface providing imperative methods to manipulate popover cards outside React.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Shared context payload type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface PopoverController<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  /** Opens a new root popover card. */
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;
  /** Opens a nested popover card attached at index. */
  openNested: (index: number, entry: TrailEntry<TData>) => void;
  /** Opens a root popover resolving data asynchronously. */
  openRootWithResolver: (
    key: string,
    anchorEvent?: import('../types').AnchorEventLike,
    options?: import('../types').OpenRootOptions,
  ) => Promise<void>;
  /** Opens a nested popover resolving data asynchronously. */
  openNestedWithResolver: (
    key: string,
    sourceKey: string,
    options?: import('../types').OpenNestedOptions,
  ) => Promise<void>;
  /** Closes popover card by key. */
  closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  /** Toggles pinned status for popover card by key. */
  togglePin: (key: TPopoverKey, rect?: DOMRect) => void;
  /** Brings popover to the top of zIndex order. */
  bringToFront: (key: TPopoverKey) => void;
  /** Updates drag coordinate offset for a pinned popover. */
  updateOffset: (key: TPopoverKey, x: number, y: number) => void;
  /** Handles pointer hover enter event. */
  hoverEnter: (key: string) => void;
  /** Handles pointer hover leave event with exit delay. */
  hoverLeave: (key: string, delay?: number) => void;
  /** Closes topmost popover card. */
  closeTopmost: (options?: { transition?: boolean }) => void;
  /** Clears all popover cards (trail and pinned). */
  clear: () => void;
  /** Clears trailing popover cards. */
  clearTrail: () => void;
  /** Reverts to previous history state snapshot. */
  undo: () => void;
  /** Re-applies next history state snapshot. */
  redo: () => void;
  /** True if previous history snapshots exist for undo. */
  canUndo: () => boolean;
  /** True if forward history snapshots exist for redo. */
  canRedo: () => boolean;
  /** Retries async data resolution for popover card. */
  retryPopover: (key: TPopoverKey) => Promise<void>;
  /** Gets current store state. */
  getState: () => PopoverStore<TData, TContext, TPopoverKey>;
  /** ScopeDisposable compliance handle clearing all active popovers. */
  dispose: () => void;
}

/**
 * Factory helper for controlling popover cards imperatively outside React component trees
 * (e.g. from WebSockets, Redux actions, API responses, or Vanilla JS DOM handlers).
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Shared context payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param store - Zustand StoreApi instance.
 * @returns PopoverController instance matching PopoverController interface.
 *
 * @example
 * ```typescript
 * import { createPopoverStore, createPopoverController } from 'popover-trail';
 *
 * const store = createPopoverStore(async (key) => ({ id: key }));
 * const controller = createPopoverController(store);
 *
 * // Close a popover card imperatively when WebSocket receives an update event
 * socket.on('dismiss', (key) => {
 *   controller.closeByKey(key);
 * });
 * ```
 *
 * @see {@link createPopoverStore}
 * @see {@link usePopoverActions}
 */
export function createPopoverController<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
): PopoverController<TData, TContext, TPopoverKey> {
  validateStoreControllerInstance(store);

  const getStoreState = () => {
    const state = store?.getState?.();
    if (!state) {
      throw new Error(
        '[popover-trail controller error]: Store instance is uninitialized or destroyed.',
      );
    }
    return state;
  };

  const clear = () => {
    getStoreState().clear();
  };

  return {
    openRoot: (ownerId: string, entry: TrailEntry<TData>) => {
      getStoreState().openRoot(ownerId, entry);
    },
    openNested: (index: number, entry: TrailEntry<TData>) => {
      getStoreState().pushNested(index, entry);
    },
    openRootWithResolver: (key, anchorEvent, options) =>
      getStoreState().openRootWithResolver(key, anchorEvent, options),
    openNestedWithResolver: (key, sourceKey, options) =>
      getStoreState().openNestedWithResolver(key, sourceKey, options),
    closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => {
      getStoreState().closeByKey(key, options);
    },
    togglePin: (key: TPopoverKey, rect?: DOMRect) => {
      getStoreState().togglePin(key, rect);
    },
    bringToFront: (key: TPopoverKey) => {
      getStoreState().bringToFront(key);
    },
    updateOffset: (key: TPopoverKey, x: number, y: number) => {
      getStoreState().updateOffset(key, x, y);
    },
    hoverEnter: (key: string) => {
      getStoreState().hoverEnter(key);
    },
    hoverLeave: (key: string, delay?: number) => {
      getStoreState().hoverLeave(key, delay);
    },
    closeTopmost: (options?: { transition?: boolean }) => {
      getStoreState().closeTopmost(options);
    },
    clear,
    clearTrail: () => {
      getStoreState().clearTrail();
    },
    undo: () => {
      getStoreState().undo();
    },
    redo: () => {
      getStoreState().redo();
    },
    canUndo: () => getStoreState().canUndo(),
    canRedo: () => getStoreState().canRedo(),
    retryPopover: (key: TPopoverKey) => getStoreState().retryPopover(key),
    getState: () => getStoreState(),
    dispose: clear,
  };
}
