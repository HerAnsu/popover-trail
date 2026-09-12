import * as React from 'react';
import { PopoverProvider } from './PopoverProvider';
import type { PopoverProviderProps } from './PopoverProviderProps';
import { usePopoverActions, usePopoverStoreApi } from './usePopoverStore';
import { usePopoverContext } from '../hooks/usePopoverSelectors';

import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';

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
export function definePopoverContext<
  TContext = unknown,
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>() {
  return {
    useContext: () => usePopoverContext<TContext>(),
    useActions: <
      TActionData = TData,
      TActionKey extends string = TPopoverKey,
    >() => usePopoverActions<TActionData, TContext, TActionKey>(),
    useStoreApi: <
      TStoreData = TData,
      TStoreKey extends string = TPopoverKey,
    >() => usePopoverStoreApi<TStoreData, TContext, TStoreKey>(),
    Provider: (props: PopoverProviderProps<TData, TContext>) =>
      React.createElement<PopoverProviderProps<TData, TContext>>(PopoverProvider, props),
  };
}
