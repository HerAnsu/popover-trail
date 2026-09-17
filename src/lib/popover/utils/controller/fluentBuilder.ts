/**
 * Fluent Builder Factory for Scoped Popover Operations.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module utils/controller/fluentBuilder
 */

import type { StoreApi } from 'zustand';
import type { PopoverStore } from '../../types';
import { createInitialTrailEntry } from '../storeHelpers';
import { createBuilderQueries } from './fluentQueries';
import {
  updateCardData,
  pinCard,
  unpinCard,
  addCardParent,
  removeCardParent,
} from './cardMutations';
import type { PopoverCardFluentBuilder } from './controllerTypes';

/**
 * Factory creating a fluent chaining builder bound to a specific popover card key.
 * Allows method chaining for mutation operations (`open`, `withData`, `pin`, `bringToFront`, etc.).
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param store - Target Zustand store instance.
 * @param key - Popover card key to bind.
 * @param getState - Safe store state accessor function.
 * @returns PopoverCardFluentBuilder chaining instance.
 *
 * @example
 * ```typescript
 * const builder = createFluentBuilder(store, 'profile-card', store.getState);
 * builder
 *   .withData({ name: 'Alice' })
 *   .bringToFront();
 * ```
 */
export function createFluentBuilder<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  getState: () => PopoverStore<TData, TContext, TPopoverKey>,
): PopoverCardFluentBuilder<TData, TPopoverKey> {
  const queries = createBuilderQueries<TData, TContext, TPopoverKey>(key, getState);

  const builder: PopoverCardFluentBuilder<TData, TPopoverKey> = {
    key,
    ...queries,
    open: (opts) => {
      getState().openRoot(key, createInitialTrailEntry(key, opts, key));
      return builder;
    },
    openWithResolver: async (evt, opts) => {
      await getState().openRootWithResolver(key, evt, opts);
      return builder;
    },
    atPlacement: () => builder,
    withOffset: (x, y) => {
      getState().updateOffset(key, x, y);
      return builder;
    },
    withData: (data) => {
      updateCardData(store, key, data);
      return builder;
    },
    pin: (rect) => {
      pinCard(getState(), key, rect);
      return builder;
    },
    unpin: () => {
      unpinCard(getState(), key);
      return builder;
    },
    togglePin: (rect) => {
      getState().togglePin(key, rect);
      return builder;
    },
    bringToFront: () => {
      getState().bringToFront(key);
      return builder;
    },
    close: (opts) => {
      getState().closeByKey(key, opts);
      return builder;
    },
    retry: async () => {
      await getState().retryPopover(key);
      return builder;
    },
    prefetch: async (pData) => getState().prefetchPopover(key, pData),
    addParent: (pKey) => {
      addCardParent(getState(), key, pKey);
      return builder;
    },
    removeParent: (pKey) => {
      removeCardParent(getState(), key, pKey);
      return builder;
    },
    when: (cond, fn) => {
      if (cond) fn(builder);
      return builder;
    },
  };

  return builder;
}
