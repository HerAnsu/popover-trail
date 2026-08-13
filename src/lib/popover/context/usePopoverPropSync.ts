import { useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, PopoverResolver, FocusLockOptions } from '../types';
import { isDeepEqual } from '../utils/storeHelpers';
import type { PopoverProviderProps } from './PopoverProviderProps';

export function syncPropIfChanged<T>(
  currentValue: T,
  newValue: T,
  setter: (val: T) => void,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b,
): void {
  if (!isEqual(currentValue, newValue)) {
    setter(newValue);
  }
}

/**
 * Internal hook managing efficient prop synchronization into store state (SRP & Performance).
 */
function syncBehaviorConfigProps<TData, TContext>(
  state: PopoverStore<TData, TContext>,
  props: PopoverProviderProps<TData, TContext>,
): void {
  syncPropIfChanged(
    state.enableArrowNavigation,
    Boolean(props.enableArrowNavigation ?? true),
    (val) => state.setEnableArrowNavigation(Boolean(val)),
  );
  syncPropIfChanged(state.allowDragWhenPinned, Boolean(props.allowDragWhenPinned ?? true), (val) =>
    state.setAllowDragWhenPinned(Boolean(val)),
  );
  syncPropIfChanged(
    state.allowDragWhenUnpinned,
    Boolean(props.allowDragWhenUnpinned ?? true),
    (val) => state.setAllowDragWhenUnpinned(Boolean(val)),
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

function syncNumericConfigProps<TData, TContext>(
  state: PopoverStore<TData, TContext>,
  props: PopoverProviderProps<TData, TContext>,
): void {
  syncPropIfChanged(state.cascadeOffsetStep, Number(props.cascadeOffsetStep ?? 8), (val) =>
    state.setCascadeOffsetStep(val),
  );
  syncPropIfChanged(
    state.exitTransitionDuration,
    Number(props.exitTransitionDuration ?? 0),
    (val) => state.setExitTransitionDuration(val),
  );
  syncPropIfChanged(state.defaultOffset, Number(props.defaultOffset ?? 8), (val) =>
    state.setDefaultOffset(val),
  );
  syncPropIfChanged(state.baseZIndex, Number(props.baseZIndex ?? 1000), (val) =>
    state.setBaseZIndex(val),
  );
  syncPropIfChanged(state.mobileBreakpoint, Number(props.mobileBreakpoint ?? 640), (val) =>
    state.setMobileBreakpoint(val),
  );
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

  if (props.initialContext !== undefined) {
    syncPropIfChanged(state.context, props.initialContext as TContext, (val) =>
      state.setContext(val as TContext),
    );
  }
  syncPropIfChanged(state.resolveData, activeResolver, (val) => state.setResolveData(val));
  syncPropIfChanged(state.activeStackGroup, props.stackGroup ?? null, (val) =>
    state.setStackGroupFilter(val),
  );
  syncPropIfChanged(
    state.focusLockOptions,
    (props.focusLockOptions ?? null) as FocusLockOptions | null | undefined,
    (val) => state.setFocusLockOptions(val ?? null),
    isDeepEqual,
  );
  syncPropIfChanged(
    state.collisionConfig,
    props.collision ?? null,
    (val) => state.setCollisionConfig(val),
    isDeepEqual,
  );
  syncPropIfChanged(state.components, props.components ?? null, (val) =>
    state.setSlotComponents(val),
  );
  syncPropIfChanged(
    state.zIndexBaseMap,
    props.zIndexBaseMap ?? null,
    (val) => state.setZIndexBaseMap(val),
    isDeepEqual,
  );
}

/**
 * Internal hook managing efficient prop synchronization into store state (SRP & Performance).
 */
export function usePopoverPropSync<TData, TContext>(
  store: StoreApi<PopoverStore<TData, TContext>>,
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
      syncBehaviorConfigProps(state, currentProps);
      syncNumericConfigProps(state, currentProps);
      syncObjectAndComplexProps(state, currentProps, activeResolver);
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
