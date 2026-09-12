/**
 * Fluent Monadic Builder Factory for Scoped Popover Operations.
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
    pin: (rect) => { pinCard(getState(), key, rect); return builder; },
    unpin: () => { unpinCard(getState(), key); return builder; },
    togglePin: (rect) => { getState().togglePin(key, rect); return builder; },
    bringToFront: () => { getState().bringToFront(key); return builder; },
    close: (opts) => { getState().closeByKey(key, opts); return builder; },
    retry: async () => {
      await getState().retryPopover(key);
      return builder;
    },
    prefetch: async (pData) => getState().prefetchPopover(key, pData),
    addParent: (pKey) => { addCardParent(getState(), key, pKey); return builder; },
    removeParent: (pKey) => { removeCardParent(getState(), key, pKey); return builder; },
    when: (cond, fn) => {
      if (cond) fn(builder);
      return builder;
    },
  };

  return builder;
}
