/**
 * Default Store Initial State Provider for popover-trail.
 * Encapsulates the complete default initial state dictionary.
 *
 * @module storeDefaults
 */

import type { PopoverResolver, PopoverCache, PopoverStateData } from '../types';
import { EMPTY_READONLY_ARRAY, EMPTY_READONLY_OBJECT } from '../types/branded';

export const EMPTY_OBJECT = EMPTY_READONLY_OBJECT;
export const EMPTY_ARRAY = EMPTY_READONLY_ARRAY;

/**
 * Returns the default initial state object for PopoverStore.
 */
export function getInitialStoreState<TData = unknown, TContext = unknown>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext,
  cache?: PopoverCache<TData>,
): Readonly<PopoverStateData<TData, TContext>> {
  return Object.freeze({
    stateRevision: 0,
    trail: EMPTY_READONLY_ARRAY,
    floating: EMPTY_READONLY_ARRAY,
    offsets: EMPTY_READONLY_OBJECT,
    pinnedStates: EMPTY_READONLY_OBJECT,
    zIndexOrder: EMPTY_READONLY_ARRAY,
    rootHydrationRequestCounter: 0,
    nestedHydrationRequestCounters: EMPTY_READONLY_OBJECT,
    ownerId: null,
    anchorElement: null,
    anchorRect: null,
    context: initialContext ?? null,
    closePinnedDescendants: false,
    collisionConfig: null,
    cache: cache ?? null,
    resolveData,
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
    responsiveMode: 'auto',
    mobileBreakpoint: 768,
    components: null,
    zIndexBaseMap: EMPTY_READONLY_OBJECT,
    allowDragWhenPinned: true,
    allowDragWhenUnpinned: true,
    focusLockOptions: null,
  });
}
