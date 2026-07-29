import type { StoreApi } from 'zustand';
import type { PopoverStore, TrailEntry } from '../types';
import { validateStoreControllerInstance } from './devWarnings';

/**
 * Controller interface providing imperative methods to manipulate popover cards outside React.
 */
export interface PopoverController<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;
  openNested: (index: number, entry: TrailEntry<TData>) => void;
  closeByKey: (key: TPopoverKey) => void;
  togglePin: (key: TPopoverKey) => void;
  closeTopmost: () => void;
  clear: () => void;
  clearTrail: () => void;
  retryPopover: (key: TPopoverKey) => Promise<void>;
  getState: () => PopoverStore<TData, TContext, TPopoverKey>;
}

/**
 * Factory helper for controlling popover cards imperatively outside React component trees
 * (e.g. from WebSockets, Redux actions, API responses, or Vanilla JS DOM handlers).
 */
export function createPopoverController<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
): PopoverController<TData, TContext, TPopoverKey> {
  validateStoreControllerInstance(store);
  return {
    openRoot: (ownerId: string, entry: TrailEntry<TData>) => {
      store?.getState?.()?.openRoot(ownerId, entry);
    },
    openNested: (index: number, entry: TrailEntry<TData>) => {
      store?.getState?.()?.pushNested(index, entry);
    },
    closeByKey: (key: TPopoverKey) => {
      store?.getState?.()?.closeByKey(key);
    },
    togglePin: (key: TPopoverKey) => {
      store?.getState?.()?.togglePin(key);
    },
    closeTopmost: () => {
      store?.getState?.()?.closeTopmost();
    },
    clear: () => {
      store?.getState?.()?.clear();
    },
    clearTrail: () => {
      store?.getState?.()?.clearTrail();
    },
    retryPopover: (key: TPopoverKey) => store?.getState?.()?.retryPopover(key) ?? Promise.resolve(),
    getState: () => store?.getState?.(),
  };
}
