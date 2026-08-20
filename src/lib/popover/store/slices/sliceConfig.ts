/**
 * Display & Configuration Domain Action Slice for popover-trail.
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
  TrailEntry,
  StatePatch,
} from '../../types';
import { isDeepEqual, findEntryInStore, shallowEqual } from '../../utils/storeHelpers';
import { isPinnedEntry } from '../storeActions';
import { isValidTransitionStatusChange } from '../fsm';
import { validateBaseZIndex } from '../../validators';
import type { SliceContext } from './sliceContext';

function patchEntryButtonControls<TData, TContext, TPopoverKey extends string = string>(
  state: {
    floating: readonly TrailEntry<TData, TPopoverKey>[];
    trail: readonly TrailEntry<TData, TPopoverKey>[];
  },
  key: TPopoverKey,
  updater: (prev?: ButtonControlConfig) => ButtonControlConfig,
): StatePatch<TData, TContext, TPopoverKey> {
  if (!key) return {};
  const entry = findEntryInStore(state.floating, state.trail, key);
  if (!entry) return {};

  const nextControls = updater(entry.buttonControls);
  if (shallowEqual(entry.buttonControls, nextControls)) {
    return {};
  }

  const updatedEntry: TrailEntry<TData, TPopoverKey> = {
    ...entry,
    buttonControls: nextControls,
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
  const { activeControllers, inFlightPromises, findEntryByKey, transitionScheduler } = deps;

  const setIfChanged = <K extends keyof PopoverStateData<TData, TContext, TPopoverKey>>(
    key: K,
    value: PopoverStateData<TData, TContext, TPopoverKey>[K],
  ) => {
    if (get()[key] !== value) {
      set((state) => ({ ...state, [key]: value }));
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

    hoverEnter: (key: TPopoverKey) => {
      if (!key) return;
      let currentKey: TPopoverKey | undefined = key;
      const visited = new Set<TPopoverKey>();
      while (currentKey && !visited.has(currentKey)) {
        visited.add(currentKey);
        transitionScheduler.cancelHover(currentKey);
        const entry = findEntryByKey(currentKey);
        currentKey = entry?.parentKey ?? entry?.originalParentKey;
      }
    },

    hoverLeave: (key: TPopoverKey, delay = 300) => {
      if (!key) return;
      if (isPinnedEntry(get().pinnedStates, key)) return;
      const performClose = () => {
        get().actions.closeByKey(key, { transition: true });
      };
      transitionScheduler.scheduleHoverLeave(key, delay, performClose);
    },

    setCascadeOffsetStep: (cascadeOffsetStep: number) =>
      setIfChanged('cascadeOffsetStep', cascadeOffsetStep),

    setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => {
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

    setButtonControls: (key: TPopoverKey, config: ButtonControlConfig) => {
      set((state) =>
        patchEntryButtonControls<TData, TContext, TPopoverKey>(state, key, (prev) => ({
          ...prev,
          ...config,
        })),
      );
    },

    toggleButtonControl: (
      key: TPopoverKey,
      controlName: 'enablePin' | 'enableClose' | 'enableDrag',
      enabled?: boolean,
    ) => {
      set((state) =>
        patchEntryButtonControls<TData, TContext, TPopoverKey>(state, key, (prev) => ({
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
