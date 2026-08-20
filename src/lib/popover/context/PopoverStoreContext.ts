import { createContext } from 'react';

/**
 * Context container holding the Zustand StoreApi instance.
 * Erased to unknown at context boundary to allow arbitrary generic stores.
 *
 * @internal
 */
export const PopoverStoreContext = createContext<unknown>(null);
PopoverStoreContext.displayName = 'PopoverStoreContext';
