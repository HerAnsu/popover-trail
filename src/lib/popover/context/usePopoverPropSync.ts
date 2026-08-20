import { useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, PopoverResolver } from '../types';
import { isDeepEqual } from '../utils/equality';
import type { PopoverProviderProps } from './PopoverProviderProps';

function syncPropIfChanged<T>(
  currentValue: T,
  newValue: T,
  setter: (val: T) => void,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b,
): void {
  if (!isEqual(currentValue, newValue)) {
    setter(newValue);
  }
}

function syncBehaviorProps<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  props: PopoverProviderProps<TData, TContext>,
): void {
  syncPropIfChanged(
    state.enableArrowNavigation,
    Boolean(props.enableArrowNavigation ?? true),
    (val: boolean) => state.setEnableArrowNavigation(val),
  );
  syncPropIfChanged(
    state.allowDragWhenPinned ?? true,
    Boolean(props.allowDragWhenPinned ?? true),
    (val: boolean) => state.setAllowDragWhenPinned(val),
  );
  syncPropIfChanged(
    state.allowDragWhenUnpinned ?? true,
    Boolean(props.allowDragWhenUnpinned ?? true),
    (val: boolean) => state.setAllowDragWhenUnpinned(val),
  );
  syncPropIfChanged(state.debug, Boolean(props.debug ?? false), (val: boolean) =>
    state.setDebug(val),
  );
  syncPropIfChanged(
    state.closePinnedDescendants,
    Boolean(props.closePinnedDescendants ?? false),
    (val: boolean) => state.setClosePinnedDescendants(val),
  );
  syncPropIfChanged(state.responsiveMode, props.responsiveMode ?? 'auto', (val) =>
    state.setResponsiveMode(val),
  );
}

function syncNumericProps<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  props: PopoverProviderProps<TData, TContext>,
): void {
  syncPropIfChanged(state.cascadeOffsetStep, Number(props.cascadeOffsetStep ?? 8), (val: number) =>
    state.setCascadeOffsetStep(val),
  );
  syncPropIfChanged(
    state.exitTransitionDuration,
    Number(props.exitTransitionDuration ?? 0),
    (val: number) => state.setExitTransitionDuration(val),
  );
  syncPropIfChanged(state.defaultOffset, Number(props.defaultOffset ?? 8), (val: number) =>
    state.setDefaultOffset(val),
  );
  syncPropIfChanged(state.baseZIndex, Number(props.baseZIndex ?? 1000), (val: number) =>
    state.setBaseZIndex(val),
  );
  syncPropIfChanged(state.mobileBreakpoint, Number(props.mobileBreakpoint ?? 640), (val: number) =>
    state.setMobileBreakpoint(val),
  );
}

function syncAnimationProps<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  props: PopoverProviderProps<TData, TContext>,
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
}

function syncComplexProps<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  props: PopoverProviderProps<TData, TContext>,
  activeResolver: PopoverResolver<TData, TContext>,
): void {
  if (props.initialContext !== undefined) {
    syncPropIfChanged(state.context, props.initialContext, (val) => {
      if (val !== null) state.setContext(val);
    });
  }
  syncPropIfChanged(state.resolveData, activeResolver, (val) => state.setResolveData(val));
  syncPropIfChanged(state.activeStackGroup, props.stackGroup ?? null, (val) =>
    state.setStackGroupFilter(val),
  );
  syncPropIfChanged(
    state.focusLockOptions,
    props.focusLockOptions ?? null,
    (val) => state.setFocusLockOptions(val ?? null),
    isDeepEqual,
  );
  syncPropIfChanged(
    state.collisionConfig,
    props.collision ?? null,
    (val) => state.setCollisionConfig(val),
    isDeepEqual,
  );
  syncPropIfChanged(
    state.components,
    props.components ?? null,
    (val) => state.setSlotComponents(val),
    isDeepEqual,
  );
  syncPropIfChanged(
    state.zIndexBaseMap,
    props.zIndexBaseMap ?? null,
    (val) => state.setZIndexBaseMap(val),
    isDeepEqual,
  );
}

/**
 * Internal hook managing clean, decoupled prop synchronization into the store state.
 */
export function usePopoverPropSync<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
  props: PopoverProviderProps<TData, TContext>,
  activeResolver: PopoverResolver<TData, TContext>,
): void {
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });

  useEffect(() => {
    store.getState().batchUpdates(() => {
      const state = store.getState();
      const currentProps = propsRef.current;
      syncBehaviorProps(state, currentProps);
      syncNumericProps(state, currentProps);
      syncAnimationProps(state, currentProps);
      syncComplexProps(state, currentProps, activeResolver);
    });
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
