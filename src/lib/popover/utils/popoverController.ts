/**
 * Imperative Store Controller and Fluent Builder Engine for popover-trail.
 * Enables controlling popover cards imperatively outside React component trees with fluent chaining.
 *
 * @module popoverController
 */

import type { StoreApi } from 'zustand';
import type {
  PopoverStore,
  TrailEntry,
  AnchorEventLike,
  OpenRootOptions,
  OpenNestedOptions,
  DragOffset,
  PopoverPlacement,
} from '../types';
import type { PopoverError } from './errors';
import { validateStoreControllerInstance } from './devWarnings';
import { createInitialTrailEntry } from './storeHelpers';
import {
  selectEntryByKey,
  selectIsPinned,
  selectOffset,
  selectBreadcrumbs,
  selectPopoverDepth,
} from '../store/storeSelectors';

/**
 * Fluent Monadic Builder interface providing chained operations and queries scoped to a single popover card.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Shared context payload type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface PopoverCardFluentBuilder<TData = unknown, TPopoverKey extends string = string> {
  /** The bound popover string key */
  readonly key: TPopoverKey;

  // --- Запросы (Queries) ---
  /** Gets current TrailEntry for this card. */
  get(): TrailEntry<TData, TPopoverKey> | undefined;
  /** True if card is currently open in either floating or trailing stack. */
  isOpen(): boolean;
  /** True if card is currently pinned. */
  isPinned(): boolean;
  /** True if card is currently in loading / resolving state. */
  isLoading(): boolean;
  /** Gets resolved payload data. */
  data(): TData | null | undefined;
  /** Gets error object if resolution failed. */
  error(): PopoverError | Error | null;
  /** Gets current 2D drag offset coordinates. */
  offset(): DragOffset;
  /** Gets breadcrumb keys path up to this popover card. */
  breadcrumbs(): readonly TPopoverKey[];
  /** Gets zero-indexed depth of this popover card in the stack. */
  depth(): number;

  // --- Мутации и действия (Mutations) ---
  /** Opens this popover as root or brings it into active trail. */
  open(options?: OpenRootOptions): this;
  /** Opens this popover via async resolver pipeline. */
  openWithResolver(anchorEvent?: AnchorEventLike, options?: OpenRootOptions): Promise<this>;
  /** Updates placement direction. */
  atPlacement(placement: PopoverPlacement): this;
  /** Updates 2D drag offset coordinates. */
  withOffset(x: number, y: number): this;
  /** Imperatively sets payload data on this card. */
  withData(data: TData): this;
  /** Pins this popover card at its current or specified DOMRect coordinates. */
  pin(rect?: DOMRect): this;
  /** Unpins this popover card. */
  unpin(): this;
  /** Toggles pinned status for this popover card. */
  togglePin(rect?: DOMRect): this;
  /** Elevates this popover to topmost zIndex. */
  bringToFront(): this;
  /** Closes this popover card. */
  close(options?: { transition?: boolean }): this;
  /** Retries async data resolution for this card. */
  retry(): Promise<this>;
  /** Prefetches async data for this card. */
  prefetch(parentData?: TData): Promise<TData | undefined>;

  // --- Условные ветвления (Fluent Branching) ---
  /** Conditionally executes mutations on this builder. */
  when(condition: boolean, mutate: (builder: this) => void): this;
}

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
  /** Focuses on a specific popover card, returning a fluent builder for chained mutations and queries. */
  focus: (key: TPopoverKey) => PopoverCardFluentBuilder<TData, TPopoverKey>;

  /** Opens a new root popover card. */
  openRoot: (ownerId: string, entry: TrailEntry<TData, TPopoverKey>) => void;
  /** Opens a nested popover card attached at index. */
  openNested: (index: number, entry: TrailEntry<TData, TPopoverKey>) => void;
  /** Opens a root popover resolving data asynchronously. */
  openRootWithResolver: (
    key: TPopoverKey,
    anchorEvent?: AnchorEventLike,
    options?: OpenRootOptions,
  ) => Promise<void>;
  /** Opens a nested popover resolving data asynchronously. */
  openNestedWithResolver: (
    key: TPopoverKey,
    sourceKey: TPopoverKey,
    options?: OpenNestedOptions,
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
  hoverEnter: (key: TPopoverKey) => void;
  /** Handles pointer hover leave event with exit delay. */
  hoverLeave: (key: TPopoverKey, delay?: number) => void;
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
 * Factory helper for controlling popover cards imperatively outside React component trees.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Shared context payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param store - Zustand StoreApi instance.
 * @returns PopoverController instance with fluent builder capabilities.
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

  const createFluentBuilder = (key: TPopoverKey): PopoverCardFluentBuilder<TData, TPopoverKey> => {
    const builder: PopoverCardFluentBuilder<TData, TPopoverKey> = {
      key,

      // Queries
      get: () => selectEntryByKey<TData, TPopoverKey>(key)(getStoreState()),
      isOpen: () => selectEntryByKey<TData, TPopoverKey>(key)(getStoreState()) !== undefined,
      isPinned: () => selectIsPinned<TPopoverKey>(key)(getStoreState()),
      isLoading: () => {
        const entry = selectEntryByKey<TData, TPopoverKey>(key)(getStoreState());
        return entry?.isLoading ?? false;
      },
      data: () => {
        const entry = selectEntryByKey<TData, TPopoverKey>(key)(getStoreState());
        return entry?.data;
      },
      error: () => {
        const entry = selectEntryByKey<TData, TPopoverKey>(key)(getStoreState());
        return entry?.error ?? null;
      },
      offset: () => selectOffset<TPopoverKey>(key)(getStoreState()),
      breadcrumbs: () => selectBreadcrumbs<TPopoverKey>(key)(getStoreState()),
      depth: () => selectPopoverDepth<TPopoverKey>(key)(getStoreState()),

      // Mutations
      open: (options) => {
        const entry = createInitialTrailEntry<TData, TPopoverKey>(key, options, key);
        getStoreState().openRoot(key, entry);
        return builder;
      },
      openWithResolver: async (anchorEvent, options) => {
        await getStoreState().openRootWithResolver(key, anchorEvent, options);
        return builder;
      },
      atPlacement: (_placement) => {
        return builder;
      },
      withOffset: (x, y) => {
        getStoreState().updateOffset(key, x, y);
        return builder;
      },
      withData: (data) => {
        store.setState((state) => {
          const inFloating = state.floating.some((e) => e.key === key);
          const inTrail = state.trail.some((e) => e.key === key);
          if (!inFloating && !inTrail) return state;

          return {
            floating: inFloating
              ? state.floating.map((e) => (e.key === key ? { ...e, data, isLoading: false } : e))
              : state.floating,
            trail: inTrail
              ? state.trail.map((e) => (e.key === key ? { ...e, data, isLoading: false } : e))
              : state.trail,
          };
        });
        return builder;
      },
      pin: (rect) => {
        if (!selectIsPinned<TPopoverKey>(key)(getStoreState())) {
          getStoreState().togglePin(key, rect);
        }
        return builder;
      },
      unpin: () => {
        if (selectIsPinned<TPopoverKey>(key)(getStoreState())) {
          getStoreState().togglePin(key);
        }
        return builder;
      },
      togglePin: (rect) => {
        getStoreState().togglePin(key, rect);
        return builder;
      },
      bringToFront: () => {
        getStoreState().bringToFront(key);
        return builder;
      },
      close: (options) => {
        getStoreState().closeByKey(key, options);
        return builder;
      },
      retry: async () => {
        await getStoreState().retryPopover(key);
        return builder;
      },
      prefetch: async (parentData) => {
        return getStoreState().prefetchPopover(key, parentData);
      },
      when: (condition, mutate) => {
        if (condition) {
          mutate(builder);
        }
        return builder;
      },
    };

    return builder;
  };

  return {
    focus: createFluentBuilder,
    openRoot: (ownerId: string, entry: TrailEntry<TData, TPopoverKey>) => {
      getStoreState().openRoot(ownerId, entry);
    },
    openNested: (index: number, entry: TrailEntry<TData, TPopoverKey>) => {
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
    hoverEnter: (key: TPopoverKey) => {
      getStoreState().hoverEnter(key);
    },
    hoverLeave: (key: TPopoverKey, delay?: number) => {
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
