/**
 * Display & Configuration Domain Action Slice for popover-trail.
 * Encapsulates store configuration setters, hover events, button controls, and layout preferences.
 *
 * @module sliceConfig
 */

import type {
  PopoverResolver,
  CollisionConfig,
  PopoverResponsiveMode,
  FocusLockOptions,
  PopoverSlotComponents,
  ButtonControlConfig,
  PopoverTransitionStatus,
  PopoverStateData,
} from '../../types';
import { isDeepEqual, findEntryInStore } from '../../utils/storeHelpers';
import { isPinnedEntry } from '../storeActions';
import { isValidTransitionStatusChange } from '../fsm';
import { validateBaseZIndex } from '../../utils/devWarnings';
import type { SliceContext } from './sliceContext';
import type { TrailEntry } from '../../types/entryTypes';

function patchEntryButtonControls<TData>(
  state: { floating: readonly TrailEntry<TData>[]; trail: readonly TrailEntry<TData>[] },
  key: string,
  updater: (prev?: ButtonControlConfig) => ButtonControlConfig,
): { floating?: readonly TrailEntry<TData>[]; trail?: readonly TrailEntry<TData>[] } {
  if (!key) return {};
  const entry: TrailEntry<TData> | undefined = findEntryInStore(state.floating, state.trail, key);
  if (!entry) return {};
  const updatedEntry: TrailEntry<TData> = {
    ...entry,
    buttonControls: updater(entry.buttonControls),
  };
  const inFloating = state.floating.some((e) => e.key === key);
  return {
    floating: inFloating
      ? state.floating.map((e) => (e.key === key ? updatedEntry : e))
      : state.floating,
    trail: inFloating ? state.trail : state.trail.map((e) => (e.key === key ? updatedEntry : e)),
  };
}

export function createConfigSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const { activeControllers, inFlightPromises, hoverCloseTimers, clearHoverTimer, findEntryByKey } =
    deps;

  const setIfChanged = <K extends keyof PopoverStateData<TData, TContext>>(
    key: K,
    value: PopoverStateData<TData, TContext>[K],
  ) => {
    if (get()[key] !== value) {
      set({ [key]: value });
    }
  };

  return {
    setContext: (context: TContext) => {
      const current = get().context;
      if (current === context) return;
      if (!isDeepEqual(current, context)) {
        set({ context });
      }
    },

    setResolveData: (newResolver: PopoverResolver<TData, TContext>) => {
      if (get().resolveData !== newResolver) {
        if (activeControllers.size > 0) {
          for (const controller of activeControllers.values()) {
            controller.abort();
          }
          activeControllers.clear();
        }
        if (inFlightPromises.size > 0) {
          inFlightPromises.clear();
        }
        set({ resolveData: newResolver });
      }
    },

    setOwnerId: (ownerId: string | null) => setIfChanged('ownerId', ownerId),

    setClosePinnedDescendants: (closePinnedDescendants: boolean) =>
      setIfChanged('closePinnedDescendants', closePinnedDescendants),

    setCollisionConfig: (collisionConfig: CollisionConfig | null) => {
      const current = get().collisionConfig;
      if (current === collisionConfig) return;
      if (!isDeepEqual(current, collisionConfig)) {
        set({ collisionConfig });
      }
    },

    setEnableArrowNavigation: (enableArrowNavigation: boolean) =>
      setIfChanged('enableArrowNavigation', enableArrowNavigation),

    setDebug: (debug: boolean) => setIfChanged('debug', debug),

    hoverEnter: (key: string) => {
      if (!key) return;
      let currentKey: string | undefined = key;
      const visited = new Set<string>();
      while (currentKey && !visited.has(currentKey)) {
        visited.add(currentKey);
        clearHoverTimer(currentKey);
        const entry = findEntryByKey(currentKey);
        currentKey = entry?.parentKey ?? entry?.originalParentKey;
      }
    },

    hoverLeave: (key: string, delay = 300) => {
      if (!key) return;
      if (isPinnedEntry(get().pinnedStates, key)) return;
      const performClose = () => {
        get().actions.closeByKey(key as unknown as TPopoverKey, { transition: true });
      };
      if (deps.scheduleHoverLeave) {
        deps.scheduleHoverLeave(key, delay, performClose);
      } else {
        clearHoverTimer(key);
        const newTimer = setTimeout(() => {
          performClose();
          hoverCloseTimers.delete(key);
        }, delay);
        hoverCloseTimers.set(key, newTimer);
      }
    },

    setCascadeOffsetStep: (cascadeOffsetStep: number) =>
      setIfChanged('cascadeOffsetStep', cascadeOffsetStep),

    setTransitionStatus: (key: string, status: PopoverTransitionStatus) => {
      if (!key) return;
      const entry = findEntryByKey(key);
      if (!entry || entry.transitionStatus === status) return;
      if (!isValidTransitionStatusChange(entry.transitionStatus, status)) return;

      set((state) => {
        const inFloating = state.floating.some((e) => e.key === key);
        return {
          floating: inFloating
            ? state.floating.map((e) => (e.key === key ? { ...e, transitionStatus: status } : e))
            : state.floating,
          trail: inFloating
            ? state.trail
            : state.trail.map((e) => (e.key === key ? { ...e, transitionStatus: status } : e)),
        };
      });
    },

    setExitTransitionDuration: (exitTransitionDuration: number) =>
      setIfChanged('exitTransitionDuration', exitTransitionDuration),

    setDefaultOffset: (defaultOffset: number) => setIfChanged('defaultOffset', defaultOffset),

    setBaseZIndex: (baseZIndex: number) => {
      validateBaseZIndex(baseZIndex);
      if (!Number.isFinite(baseZIndex) || baseZIndex < 0) return;
      setIfChanged('baseZIndex', baseZIndex);
    },

    setGlobalAnimationClassNames: (mounting: string, unmounting: string, mounted: string) => {
      const {
        mountingClassName: currentMounting,
        unmountingClassName: currentUnmounting,
        mountedClassName: currentMounted,
      } = get();
      if (
        currentMounting !== mounting ||
        currentUnmounting !== unmounting ||
        currentMounted !== mounted
      ) {
        set({
          mountingClassName: mounting,
          unmountingClassName: unmounting,
          mountedClassName: mounted,
        });
      }
    },

    setAllowDragWhenPinned: (allow: boolean) => setIfChanged('allowDragWhenPinned', allow),

    setAllowDragWhenUnpinned: (allow: boolean) => setIfChanged('allowDragWhenUnpinned', allow),

    setMobileBreakpoint: (breakpoint: number) => setIfChanged('mobileBreakpoint', breakpoint),

    setFocusLockOptions: (options: FocusLockOptions | null) =>
      setIfChanged('focusLockOptions', options),

    setSlotComponents: (components: PopoverSlotComponents | null) => {
      if (!isDeepEqual(get().components, components)) {
        set({ components });
      }
    },

    setButtonControls: (key: string, config: ButtonControlConfig) => {
      set((state) => patchEntryButtonControls(state, key, (prev) => ({ ...prev, ...config })));
    },

    toggleButtonControl: (
      key: string,
      controlName: 'enablePin' | 'enableClose' | 'enableDrag',
      enabled?: boolean,
    ) => {
      set((state) =>
        patchEntryButtonControls(state, key, (prev) => ({
          ...prev,
          [controlName]: enabled ?? !prev?.[controlName],
        })),
      );
    },

    setStackGroupFilter: (stackGroup: string | null) =>
      setIfChanged('activeStackGroup', stackGroup),

    setZIndexBaseMap: (zIndexBaseMap: Record<string, number> | null) => {
      if (!isDeepEqual(get().zIndexBaseMap, zIndexBaseMap)) {
        set({ zIndexBaseMap });
      }
    },

    setResponsiveMode: (mode: PopoverResponsiveMode) => setIfChanged('responsiveMode', mode),
  };
}
