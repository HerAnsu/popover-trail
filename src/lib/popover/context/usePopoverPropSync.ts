/**
 * Internal hook managing clean, decoupled prop synchronization into the store state.
 *
 * @module context/usePopoverPropSync
 */

import { useEffect, useRef } from 'react';
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
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    const currentProps = propsRef.current;
    const patch: Partial<PopoverStateData<TData, TContext, string>> = {
      enableArrowNavigation: Boolean(currentProps.enableArrowNavigation ?? true),
      allowDragWhenPinned: Boolean(currentProps.allowDragWhenPinned ?? true),
      allowDragWhenUnpinned: Boolean(currentProps.allowDragWhenUnpinned ?? true),
      debug: Boolean(currentProps.debug ?? false),
      closePinnedDescendants: Boolean(currentProps.closePinnedDescendants ?? false),
      responsiveMode: currentProps.responsiveMode ?? 'auto',
      cascadeOffsetStep: Number(currentProps.cascadeOffsetStep ?? DEFAULT_CASCADE_OFFSET_STEP),
      exitTransitionDuration: Number(currentProps.exitTransitionDuration ?? 0),
      defaultOffset: Number(currentProps.defaultOffset ?? DEFAULT_OFFSET_PX),
      baseZIndex: Number(currentProps.baseZIndex ?? DEFAULT_BASE_Z_INDEX),
      mobileBreakpoint: Number(currentProps.mobileBreakpoint ?? DEFAULT_MOBILE_BREAKPOINT_PX),
      mountingClassName: String(currentProps.mountingClassName ?? 'mounting'),
      unmountingClassName: String(currentProps.unmountingClassName ?? 'unmounting'),
      mountedClassName: String(currentProps.mountedClassName ?? 'mounted'),
      context: currentProps.initialContext,
      resolveData: activeResolver,
      activeStackGroup: currentProps.stackGroup ?? null,
      focusLockOptions: currentProps.focusLockOptions ?? null,
      collisionConfig: currentProps.collision ?? null,
      components: currentProps.components ?? null,
      zIndexBaseMap: currentProps.zIndexBaseMap ?? null,
    };

    store.getState().actions.updateConfig(patch);
  }, [
    store,
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
