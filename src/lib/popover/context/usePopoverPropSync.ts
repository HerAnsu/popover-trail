/**
 * Internal hook managing clean, decoupled prop synchronization into the store state.
 *
 * @module context/usePopoverPropSync
 */

import { useEffect } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type {
  PopoverStore,
  PopoverResolver,
  PopoverStateData,
  StoreSliceDescriptor,
} from '../types';
import type { PopoverProviderProps } from './PopoverProviderProps';
import {
  DEFAULT_CASCADE_OFFSET_STEP,
  DEFAULT_OFFSET_PX,
  DEFAULT_BASE_Z_INDEX,
  DEFAULT_MOBILE_BREAKPOINT_PX,
} from '../constants';
import { useLatestRef } from '../hooks/useHookUtils';

/**
 * Synchronizes incoming React provider props directly into the Zustand store configuration state.
 *
 * Runs an effect when provider props change, dispatching an atomic `updateConfig` patch
 * to keep the headless store aligned with declarative React configuration.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TSlices - Array of custom slice descriptors.
 * @param store - Vanilla Zustand store instance.
 * @param props - Root PopoverProvider props.
 * @param activeResolver - Data resolver function.
 *
 * @example
 * ```tsx
 * function PopoverProviderInternal({ children, ...props }) {
 *   const store = useCreatePopoverStore(props);
 *   usePopoverPropSync(store, props, props.resolveData);
 *   return <PopoverStoreContext.Provider value={store}>{children}</PopoverStoreContext.Provider>;
 * }
 * ```
 */
export function usePopoverPropSync<
  TData = unknown,
  TContext = unknown,
  TSlices extends readonly StoreSliceDescriptor<
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
>(
  store: StoreApi<PopoverStore<TData, TContext, string>>,
  props: PopoverProviderProps<TData, TContext, TSlices>,
  activeResolver: PopoverResolver<TData, TContext>,
): void {
  const propsRef = useLatestRef(props);

  useEffect(() => {
    const {
      enableArrowNavigation = true,
      allowDragWhenPinned = true,
      allowDragWhenUnpinned = true,
      debug = false,
      closePinnedDescendants = false,
      responsiveMode = 'auto',
      cascadeOffsetStep = DEFAULT_CASCADE_OFFSET_STEP,
      exitTransitionDuration = 0,
      defaultOffset = DEFAULT_OFFSET_PX,
      baseZIndex = DEFAULT_BASE_Z_INDEX,
      mobileBreakpoint = DEFAULT_MOBILE_BREAKPOINT_PX,
      mountingClassName = 'mounting',
      unmountingClassName = 'unmounting',
      mountedClassName = 'mounted',
      initialContext,
      stackGroup = null,
      focusLockOptions = null,
      collision = null,
      components = null,
      zIndexBaseMap = null,
    } = propsRef.current;

    const patch: Partial<PopoverStateData<TData, TContext, string>> = {
      enableArrowNavigation: Boolean(enableArrowNavigation),
      allowDragWhenPinned: Boolean(allowDragWhenPinned),
      allowDragWhenUnpinned: Boolean(allowDragWhenUnpinned),
      debug: Boolean(debug),
      closePinnedDescendants: Boolean(closePinnedDescendants),
      responsiveMode,
      cascadeOffsetStep: Number(cascadeOffsetStep),
      exitTransitionDuration: Number(exitTransitionDuration),
      defaultOffset: Number(defaultOffset),
      baseZIndex: Number(baseZIndex),
      mobileBreakpoint: Number(mobileBreakpoint),
      mountingClassName: String(mountingClassName),
      unmountingClassName: String(unmountingClassName),
      mountedClassName: String(mountedClassName),
      context: initialContext,
      resolveData: activeResolver,
      activeStackGroup: stackGroup,
      focusLockOptions,
      collisionConfig: collision,
      components,
      zIndexBaseMap,
    };

    const { updateConfig } = store.getState().actions;
    updateConfig(patch);
  }, [
    store,
    propsRef,
    props.enableArrowNavigation,
    props.allowDragWhenPinned,
    props.allowDragWhenUnpinned,
    props.debug,
    props.cascadeOffsetStep,
    props.exitTransitionDuration,
    props.defaultOffset,
    props.baseZIndex,
    props.mountingClassName,
    props.unmountingClassName,
    props.mountedClassName,
    props.initialContext,
    activeResolver,
    props.closePinnedDescendants,
    props.collision,
    props.responsiveMode,
    props.mobileBreakpoint,
    props.stackGroup,
    props.focusLockOptions,
    props.components,
    props.zIndexBaseMap,
  ]);
}
