import { useMemo, useState, useEffect } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, PopoverResolver } from '../types';
import { createPopoverStore } from '../store';
import { useClickOutside } from '../hooks/useClickOutside';
import {
  validateProviderResolver,
  validateCascadeStep,
  validateDefaultOffset,
  validateBaseZIndex,
  validateExitDuration,
} from '../utils/devWarnings';
import { PopoverStoreContext } from './PopoverStoreContext';
import { usePopoverKeyboardShortcuts } from './usePopoverKeyboard';
import { usePopoverPropSync } from './usePopoverPropSync';
import type { PopoverProviderProps } from './PopoverProviderProps';

interface SchemaLike<TData, TContext> {
  createResolver?<TC = TContext>(): PopoverResolver<TData, TC>;
}

/**
 * PopoverProvider Component.
 * Instantiates the underlying Zustand popover store and supplies it to the React component sub-tree.
 *
 * @remarks
 * Coordinates store lifecycle, prop synchronization, keyboard shortcuts (Escape / Arrow keys),
 * click-outside listener interception, and schema/resolver binding.
 *
 * @example
 * ```tsx
 * import { PopoverProvider, createPopoverSchema, defineSchemaNode } from 'popover-trail';
 *
 * const schema = createPopoverSchema({
 *   user: defineSchemaNode(async (id: string) => fetchUser(id)),
 * });
 *
 * export function App() {
 *   return (
 *     <PopoverProvider schema={schema} baseZIndex={1000} cascadeOffsetStep={12}>
 *       <MyApplication />
 *     </PopoverProvider>
 *   );
 * }
 * ```
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Shared context payload type.
 * @param props - Provider configuration props.
 */
export function PopoverProvider<TData = unknown, TContext = unknown>(
  props: PopoverProviderProps<TData, TContext>,
) {
  const {
    children,
    schema,
    resolveData,
    initialContext,
    clickOutside,
    enableKeyboardClose = true,
    cascadeOffsetStep = 8,
    exitTransitionDuration = 0,
    defaultOffset = 8,
    baseZIndex = 1000,
    cache,
  } = props;

  validateProviderResolver(Boolean(resolveData || schema));
  validateCascadeStep(cascadeOffsetStep);
  validateDefaultOffset(defaultOffset);
  validateBaseZIndex(baseZIndex);
  validateExitDuration(exitTransitionDuration);

  const activeResolver = useMemo<PopoverResolver<TData, TContext>>(() => {
    if (resolveData) return resolveData;
    const schemaInstance = schema as SchemaLike<TData, TContext> | undefined;
    if (schemaInstance && typeof schemaInstance.createResolver === 'function') {
      return schemaInstance.createResolver();
    }
    return () =>
      Promise.reject(new Error('No resolveData callback or schema provided to PopoverProvider'));
  }, [resolveData, schema]);

  // Use useState to instantiate the store once
  const [store] = useState(() =>
    createPopoverStore<TData, TContext>(activeResolver, initialContext, cache),
  );

  // Synchronize all provider props efficiently
  usePopoverPropSync(store, props, activeResolver);

  // Cleanup on Provider unmount: abort all in-flight requests and reset state
  useEffect(() => {
    return () => {
      store.getState().actions.closeAll();
    };
  }, [store]);

  // Handle Escape key closing globally
  usePopoverKeyboardShortcuts(store, enableKeyboardClose);

  // Setup click outside logic using custom hook
  useClickOutside({
    store: store as StoreApi<PopoverStore<unknown, unknown>>,
    clickOutside,
  });

  return (
    <PopoverStoreContext value={store as StoreApi<PopoverStore<unknown, unknown>>}>
      {children}
    </PopoverStoreContext>
  );
}
