import type { StoreApi } from 'zustand';
import type { PopoverStore, TrailEntry } from '../types';

/**
 * Controller interface providing imperative methods to manipulate popover cards outside React.
 */
export interface PopoverController<TData = unknown, TContext = unknown> {
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;
  openNested: (index: number, entry: TrailEntry<TData>) => void;
  closeByKey: (key: string) => void;
  togglePin: (key: string) => void;
  clear: () => void;
  getState: () => PopoverStore<TData, TContext>;
}

/**
 * Factory helper for controlling popover cards imperatively outside React component trees
 * (e.g. from WebSockets, Redux actions, API responses, or Vanilla JS DOM handlers).
 */
export function createPopoverController<TData = unknown, TContext = unknown>(
  store: StoreApi<PopoverStore<TData, TContext>>,
): PopoverController<TData, TContext> {
  return {
    openRoot: (ownerId: string, entry: TrailEntry<TData>) => {
      store.getState().openRoot(ownerId, entry);
    },
    openNested: (index: number, entry: TrailEntry<TData>) => {
      store.getState().pushNested(index, entry);
    },
    closeByKey: (key: string) => {
      store.getState().closeByKey(key);
    },
    togglePin: (key: string) => {
      store.getState().togglePin(key);
    },
    clear: () => {
      store.getState().clear();
    },
    getState: () => store.getState(),
  };
}
