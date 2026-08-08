import { createContext } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../types';

/**
 * Context container holding the Zustand StoreApi instance.
 *
 * @internal
 */
export const PopoverStoreContext = createContext<StoreApi<PopoverStore<unknown, unknown>> | null>(
  null,
);
PopoverStoreContext.displayName = 'PopoverStoreContext';
