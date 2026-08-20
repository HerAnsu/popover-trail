import { useMemo, useState, useEffect } from 'react';
import type { PopoverResolver, StoreSliceDescriptor } from '../types';
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

function isSchemaWithResolver<TData, TContext>(
  val: unknown,
): val is { createResolver: () => PopoverResolver<TData, TContext> } {
  return (
    typeof val === 'object' &&
    val !== null &&
    'createResolver' in val &&
    typeof val.createResolver === 'function'
  );
}

/**
 * PopoverProvider Component.
 * Instantiates the underlying Zustand popover store and supplies it to the React component sub-tree.
 *
 * @remarks
 * Coordinates store lifecycle, prop synchronization, keyboard shortcuts (Escape / Arrow keys),
 * click-outside listener interception, schema/resolver binding, and custom OCP domain slices.
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
 * @template TSlices - Tuple of custom StoreSliceDescriptor instances.
 * @param props - Provider configuration props.
 */
export function PopoverProvider<
  TData = unknown,
  TContext = unknown,
  const TSlices extends readonly StoreSliceDescriptor<
    Record<string, unknown>,
    Record<string, unknown>,
    TData,
    TContext,
    string
  >[] = readonly StoreSliceDescriptor<
    Record<string, unknown>,
    Record<string, unknown>,
    TData,
    TContext,
    string
  >[],
>(props: PopoverProviderProps<TData, TContext, TSlices>) {
  const {
    children,
    schema,
    resolveData,
    initialContext,
    slices,
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
    if (isSchemaWithResolver<TData, TContext>(schema)) {
      const resolverFn = schema.createResolver();
      if (resolverFn) return resolverFn;
    }
    return () =>
      Promise.reject(new Error('No resolveData callback or schema provided to PopoverProvider'));
  }, [resolveData, schema]);

  // Use useState to instantiate the store once
  const [store] = useState(() =>
    createPopoverStore<TData, TContext, string, TSlices>(activeResolver, {
      initialContext,
      cache,
      customSlices: slices,
    }),
  );

  // Synchronize all provider props efficiently
  usePopoverPropSync(store, props, activeResolver);

  // Cleanup on Provider unmount: abort all in-flight requests and reset state
  useEffect(() => {
    return () => {
      store.getState().actions.closeAll();
      store.dispose();
    };
  }, [store]);

  // Handle Escape key closing globally
  usePopoverKeyboardShortcuts(store, enableKeyboardClose);

  // Setup click outside logic using custom hook
  useClickOutside({
    store,
    clickOutside,
  });

  return <PopoverStoreContext value={store}>{children}</PopoverStoreContext>;
}
