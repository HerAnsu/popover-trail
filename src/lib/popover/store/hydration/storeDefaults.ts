/**
 * Frozen Initial Default State Constants and Record Creators for popover-trail store.
 *
 * @module storeDefaults
 */

import type { PopoverResolver, PopoverCache, PopoverStateData, DragOffset } from '../../types';
import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  EMPTY_SET,
  emptyRecord,
  emptySet,
} from '../../types/branded';
import {
  DEFAULT_BASE_Z_INDEX,
  DEFAULT_CASCADE_OFFSET_STEP,
  DEFAULT_MOBILE_BREAKPOINT_PX,
  DEFAULT_OFFSET_PX,
  ZERO_OFFSET,
} from '../../constants';

export { EMPTY_ARRAY, EMPTY_OBJECT, EMPTY_SET, ZERO_OFFSET, emptyRecord, emptySet };

export const INITIAL_TRAIL_STATE = Object.freeze({
  trail: EMPTY_ARRAY,
  floating: EMPTY_ARRAY,
  ownerId: null,
  zIndexOrder: EMPTY_ARRAY,
});

export const INITIAL_PINNING_STATE = Object.freeze({
  offsets: EMPTY_OBJECT,
  pinnedStates: EMPTY_OBJECT,
});

export const INITIAL_CONFIG_STATE = Object.freeze({
  nestedHydrationRequestCounters: EMPTY_OBJECT,
  rootHydrationRequestCounter: 0,
  anchorElement: null,
  anchorRect: null,
  stateRevision: 0,
  closePinnedDescendants: false,
  collisionConfig: null,
  enableArrowNavigation: true,
  debug: false,
  cascadeOffsetStep: DEFAULT_CASCADE_OFFSET_STEP,
  exitTransitionDuration: 0,
  defaultOffset: DEFAULT_OFFSET_PX,
  baseZIndex: DEFAULT_BASE_Z_INDEX,
  mountingClassName: '',
  unmountingClassName: '',
  mountedClassName: '',
  activeStackGroup: null,
  responsiveMode: 'auto' as const,
  mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT_PX,
  components: null,
  zIndexBaseMap: null,
  allowDragWhenPinned: true,
  allowDragWhenUnpinned: true,
  focusLockOptions: null,
});

export interface ResettableStorePatch<TPopoverKey extends string = string> {
  readonly trail: readonly never[];
  readonly floating: readonly never[];
  readonly ownerId: null;
  readonly zIndexOrder: readonly never[];
  readonly offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  readonly rootHydrationRequestCounter: 0;
  readonly nestedHydrationRequestCounters: Readonly<Partial<Record<TPopoverKey, number>>>;
  readonly anchorElement: null;
  readonly anchorRect: null;
}

export const RESETTABLE_STORE_PATCH: ResettableStorePatch<string> = Object.freeze({
  ...INITIAL_TRAIL_STATE,
  offsets: emptyRecord<string, Readonly<DragOffset>>(),
  pinnedStates: emptyRecord<string, boolean>(),
  zIndexOrder: EMPTY_ARRAY,
  rootHydrationRequestCounter: 0,
  nestedHydrationRequestCounters: emptyRecord<string, number>(),
  anchorElement: null,
  anchorRect: null,
});

/**
 * Returns a clean, frozen patch for resetting dynamic store properties to initial empty values.
 *
 * @example
 * ```ts
 * const patch = getResettableStorePatch();
 * store.setState(patch);
 * ```
 *
 * @template TPopoverKey - Union of valid popover keys.
 * @returns ResettableStorePatch containing empty arrays, records, and zero counters.
 */
export function getResettableStorePatch<
  TPopoverKey extends string = string,
>(): ResettableStorePatch<TPopoverKey> {
  return {
    ...INITIAL_TRAIL_STATE,
    offsets: emptyRecord<TPopoverKey, Readonly<DragOffset>>(),
    pinnedStates: emptyRecord<TPopoverKey, boolean>(),
    zIndexOrder: EMPTY_ARRAY,
    rootHydrationRequestCounter: 0,
    nestedHydrationRequestCounters: emptyRecord<TPopoverKey, number>(),
    anchorElement: null,
    anchorRect: null,
  };
}

/**
 * Constructs the complete baseline initial state object for a newly initialized popover store.
 *
 * @example
 * ```ts
 * const initialState = getInitialStoreState(resolveData, initialContext, cache);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param resolveData - Async data resolver function.
 * @param initialContext - Optional initial context object.
 * @param cache - Optional cache instance override.
 * @returns Complete initial PopoverStateData object.
 */
export function getInitialStoreState<
  TData,
  TContext,
  TPopoverKey extends string = string,
>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext,
  cache?: PopoverCache<TData>,
): PopoverStateData<TData, TContext, TPopoverKey> {
  return {
    ...INITIAL_TRAIL_STATE,
    ...INITIAL_PINNING_STATE,
    ...INITIAL_CONFIG_STATE,
    offsets: emptyRecord<TPopoverKey, Readonly<DragOffset>>(),
    pinnedStates: emptyRecord<TPopoverKey, boolean>(),
    nestedHydrationRequestCounters: emptyRecord<TPopoverKey, number>(),
    resolveData,
    context: initialContext ?? null,
    cache: cache ?? null,
  };
}
