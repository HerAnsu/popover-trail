import * as React from 'react';
import { PopoverProvider } from './PopoverProvider';
import type { PopoverProviderProps } from './PopoverProviderProps';
import { usePopoverActions, usePopoverStoreApi } from './usePopoverStore';
import { usePopoverContext } from '../hooks/usePopoverSelectors';

/**
 * Factory creating pre-bound PopoverProvider and custom hooks for a specific shared global app TContext.
 * Eliminates repeating generic parameter types across components.
 *
 * @template TContext - Global shared context type.
 *
 * @example
 * ```tsx
 * const { Provider, useContext, useActions } = definePopoverContext<MyGlobalContext>();
 * ```
 */
export function definePopoverContext<TContext = unknown>() {
  return {
    useContext: () => usePopoverContext<TContext>(),
    useActions: <TData = unknown>() => usePopoverActions<TData, TContext>(),
    useStoreApi: <TData = unknown>() => usePopoverStoreApi<TData, TContext>(),
    Provider: (props: PopoverProviderProps<unknown, TContext>) =>
      React.createElement<PopoverProviderProps<unknown, TContext>>(PopoverProvider, props),
  };
}
