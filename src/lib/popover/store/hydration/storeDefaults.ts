/**
 * Frozen Initial Default State Constants and Record Creators for popover-trail store.
 *
 * @module storeDefaults
 */

import type { PopoverResolver, PopoverCache, PopoverStateData, DragOffset } from '../../types';
import {
  EMPTY_READONLY_ARRAY,
  EMPTY_READONLY_OBJECT,
  EMPTY_READONLY_SET,
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

export const EMPTY_ARRAY = EMPTY_READONLY_ARRAY;
export const EMPTY_OBJECT = EMPTY_READONLY_OBJECT;
export const EMPTY_SET = EMPTY_READONLY_SET;
export { ZERO_OFFSET, emptyRecord, emptySet };


export const INITIAL_TRAIL_STATE = Object.freeze({
  trail: EMPTY_READONLY_ARRAY,
  floating: EMPTY_READONLY_ARRAY,
  ownerId: null,
  zIndexOrder: EMPTY_READONLY_ARRAY,
});

export const INITIAL_PINNING_STATE = Object.freeze({
  offsets: EMPTY_READONLY_OBJECT,
  pinnedStates: EMPTY_READONLY_OBJECT,
});

export const INITIAL_CONFIG_STATE = Object.freeze({
  nestedHydrationRequestCounters: EMPTY_READONLY_OBJECT,
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
  zIndexOrder: EMPTY_READONLY_ARRAY,
  rootHydrationRequestCounter: 0,
  nestedHydrationRequestCounters: emptyRecord<string, number>(),
  anchorElement: null,
  anchorRect: null,
});

export function getResettableStorePatch<
  TPopoverKey extends string = string,
>(): ResettableStorePatch<TPopoverKey> {
  return {
    ...INITIAL_TRAIL_STATE,
    offsets: emptyRecord<TPopoverKey, Readonly<DragOffset>>(),
    pinnedStates: emptyRecord<TPopoverKey, boolean>(),
    zIndexOrder: EMPTY_READONLY_ARRAY,
    rootHydrationRequestCounter: 0,
    nestedHydrationRequestCounters: emptyRecord<TPopoverKey, number>(),
    anchorElement: null,
    anchorRect: null,
  };
}

export function getInitialStoreState<
  TData = unknown,
  TContext = unknown,
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
