/**
 * Modular Default Store Initial State Provider for popover-trail.
 * Provides immutable, slice-driven initial state dictionaries with strict generic typing.
 *
 * @module storeDefaults
 */

import type { PopoverResolver, PopoverCache, PopoverStateData, DragOffset } from '../types';
import { EMPTY_READONLY_ARRAY, EMPTY_READONLY_OBJECT } from '../types/branded';

/** Initial state slice for trail hierarchy */
export const INITIAL_TRAIL_STATE = Object.freeze({
  stateRevision: 0,
  trail: EMPTY_READONLY_ARRAY,
  ownerId: null,
  anchorElement: null,
  anchorRect: null,
  rootHydrationRequestCounter: 0,
  nestedHydrationRequestCounters: EMPTY_READONLY_OBJECT,
});

/** Initial state slice for modeless pinning and floating cards */
export const INITIAL_PINNING_STATE = Object.freeze({
  floating: EMPTY_READONLY_ARRAY,
  offsets: EMPTY_READONLY_OBJECT,
  pinnedStates: EMPTY_READONLY_OBJECT,
  zIndexOrder: EMPTY_READONLY_ARRAY,
});

/** Initial state slice for display and theme configurations */
export const INITIAL_CONFIG_STATE = Object.freeze({
  closePinnedDescendants: false,
  collisionConfig: null,
  enableArrowNavigation: true,
  debug: false,
  cascadeOffsetStep: 8,
  exitTransitionDuration: 0,
  defaultOffset: 8,
  baseZIndex: 1000,
  mountingClassName: '',
  unmountingClassName: '',
  mountedClassName: '',
  activeStackGroup: null,
  responsiveMode: 'auto' as const,
  mobileBreakpoint: 768,
  components: null,
  zIndexBaseMap: null,
  allowDragWhenPinned: true,
  allowDragWhenUnpinned: true,
  focusLockOptions: null,
});

/**
 * Generates an immutable, fully typed initial store state.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export function getInitialStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext,
  cache?: PopoverCache<TData>,
): Readonly<PopoverStateData<TData, TContext, TPopoverKey>> {
  const state: PopoverStateData<TData, TContext, TPopoverKey> = {
    ...INITIAL_TRAIL_STATE,
    ...INITIAL_PINNING_STATE,
    ...INITIAL_CONFIG_STATE,
    offsets: EMPTY_READONLY_OBJECT as Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>,
    pinnedStates: EMPTY_READONLY_OBJECT as Readonly<Partial<Record<TPopoverKey, boolean>>>,
    nestedHydrationRequestCounters: EMPTY_READONLY_OBJECT as Readonly<
      Partial<Record<TPopoverKey, number>>
    >,
    zIndexBaseMap: null,
    resolveData,
    context: initialContext ?? null,
    cache: cache ?? null,
  };
  return Object.freeze(state);
}

export {
  EMPTY_READONLY_OBJECT as EMPTY_OBJECT,
  EMPTY_READONLY_ARRAY as EMPTY_ARRAY,
} from '../types/branded';
