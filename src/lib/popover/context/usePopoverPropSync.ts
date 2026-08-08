import { useEffect } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, PopoverResolver } from '../types';
import { isDeepEqual } from '../utils/storeHelpers';
import type { PopoverProviderProps } from './PopoverProviderProps';

/**
 * Internal hook managing efficient prop synchronization into store state (SRP & Performance).
 */
function syncBehaviorConfigProps<TData, TContext>(
  state: PopoverStore<TData, TContext>,
  props: PopoverProviderProps<TData, TContext>,
): void {
  const enableArrowNav = Boolean(props.enableArrowNavigation ?? true);
  if (state.enableArrowNavigation !== enableArrowNav) {
    state.setEnableArrowNavigation(enableArrowNav);
  }

  const dragPinned = Boolean(props.allowDragWhenPinned ?? true);
  if (state.allowDragWhenPinned !== dragPinned) {
    state.setAllowDragWhenPinned(dragPinned);
  }

  const dragUnpinned = Boolean(props.allowDragWhenUnpinned ?? true);
  if (state.allowDragWhenUnpinned !== dragUnpinned) {
    state.setAllowDragWhenUnpinned(dragUnpinned);
  }

  const dbg = Boolean(props.debug ?? false);
  if (state.debug !== dbg) {
    state.setDebug(dbg);
  }

  const closePinned = Boolean(props.closePinnedDescendants ?? false);
  if (state.closePinnedDescendants !== closePinned) {
    state.setClosePinnedDescendants(closePinned);
  }

  const respMode = props.responsiveMode ?? 'auto';
  if (state.responsiveMode !== respMode) {
    state.setResponsiveMode(respMode);
  }
}

function syncNumericConfigProps<TData, TContext>(
  state: PopoverStore<TData, TContext>,
  props: PopoverProviderProps<TData, TContext>,
): void {
  const cascadeStep = Number(props.cascadeOffsetStep ?? 8);
  if (state.cascadeOffsetStep !== cascadeStep) {
    state.setCascadeOffsetStep(cascadeStep);
  }

  const exitDur = Number(props.exitTransitionDuration ?? 0);
  if (state.exitTransitionDuration !== exitDur) {
    state.setExitTransitionDuration(exitDur);
  }

  const defOffset = Number(props.defaultOffset ?? 8);
  if (state.defaultOffset !== defOffset) {
    state.setDefaultOffset(defOffset);
  }

  const zIndex = Number(props.baseZIndex ?? 1000);
  if (state.baseZIndex !== zIndex) {
    state.setBaseZIndex(zIndex);
  }

  const mobBreakpoint = Number(props.mobileBreakpoint ?? 640);
  if (state.mobileBreakpoint !== mobBreakpoint) {
    state.setMobileBreakpoint(mobBreakpoint);
  }
}

function syncObjectAndComplexProps<TData, TContext>(
  state: PopoverStore<TData, TContext>,
  props: PopoverProviderProps<TData, TContext>,
  activeResolver: PopoverResolver<TData, TContext>,
): void {
  const mountingName = String(props.mountingClassName ?? 'mounting');
  const unmountingName = String(props.unmountingClassName ?? 'unmounting');
  const mountedName = String(props.mountedClassName ?? 'mounted');
  if (
    state.mountingClassName !== mountingName ||
    state.unmountingClassName !== unmountingName ||
    state.mountedClassName !== mountedName
  ) {
    state.setGlobalAnimationClassNames(mountingName, unmountingName, mountedName);
  }

  if (state.context !== props.initialContext) {
    state.setContext(props.initialContext as TContext);
  }

  if (state.resolveData !== activeResolver) {
    state.setResolveData(activeResolver);
  }

  const stackGroupFilter = props.stackGroup ?? null;
  if (state.activeStackGroup !== stackGroupFilter) {
    state.setStackGroupFilter(stackGroupFilter);
  }

  if (props.focusLockOptions && !isDeepEqual(state.focusLockOptions, props.focusLockOptions)) {
    state.setFocusLockOptions(props.focusLockOptions);
  }

  const collisionConfig = props.collision ?? null;
  if (!isDeepEqual(state.collisionConfig, collisionConfig)) {
    state.setCollisionConfig(collisionConfig);
  }

  const slotComponents = props.components ?? null;
  if (state.components !== slotComponents) {
    state.setSlotComponents(slotComponents);
  }

  const zIndexMap = props.zIndexBaseMap ?? null;
  if (!isDeepEqual(state.zIndexBaseMap, zIndexMap)) {
    state.setZIndexBaseMap(zIndexMap);
  }
}

/**
 * Internal hook managing efficient prop synchronization into store state (SRP & Performance).
 */
export function usePopoverPropSync<TData, TContext>(
  store: StoreApi<PopoverStore<TData, TContext>>,
  props: PopoverProviderProps<TData, TContext>,
  activeResolver: PopoverResolver<TData, TContext>,
): void {
  useEffect(() => {
    store.getState().batchUpdates(() => {
      const state = store.getState();
      syncBehaviorConfigProps(state, props);
      syncNumericConfigProps(state, props);
      syncObjectAndComplexProps(state, props, activeResolver);
    });
  }, [
    store,
    props,
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
