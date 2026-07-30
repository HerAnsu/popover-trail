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
  /** Closes popover card by key. */
  closeByKey: (key: TPopoverKey) => void;
  /** Toggles pinned status for popover card by key. */
  togglePin: (key: TPopoverKey) => void;
  /** Closes topmost popover card. */
  closeTopmost: () => void;
  /** Clears all popover cards (trail and pinned). */
  clear: () => void;
  /** Clears trailing popover cards. */
  clearTrail: () => void;
  /** Retries async data resolution for popover card. */
  retryPopover: (key: TPopoverKey) => Promise<void>;
  /** Gets current store state. */
  getState: () => PopoverStore<TData, TContext, TPopoverKey>;
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

  return {
    openRoot: (ownerId: string, entry: TrailEntry<TData>) => {
      getStoreState().openRoot(ownerId, entry);
    },
    openNested: (index: number, entry: TrailEntry<TData>) => {
      getStoreState().pushNested(index, entry);
    },
    closeByKey: (key: TPopoverKey) => {
      getStoreState().closeByKey(key);
    },
    togglePin: (key: TPopoverKey) => {
      getStoreState().togglePin(key);
    },
    closeTopmost: () => {
      getStoreState().closeTopmost();
    },
    clear: () => {
      getStoreState().clear();
    },
    clearTrail: () => {
      getStoreState().clearTrail();
    },
    retryPopover: (key: TPopoverKey) => getStoreState().retryPopover(key),
    getState: () => getStoreState(),
  };
}
