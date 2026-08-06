/**
 * Default Store Initial State Provider for popover-trail.
 * Encapsulates the complete default initial state dictionary.
 *
 * @module storeDefaults
 */

import type { PopoverResolver, PopoverCache, PopoverStateData } from '../types';

/**
 * Returns the default initial state object for PopoverStore.
 */
export function getInitialStoreState<TData = unknown, TContext = unknown>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext,
  cache?: PopoverCache<TData>,
): Readonly<PopoverStateData<TData, TContext>> {
  return {
    trail: [],
    floating: [],
    offsets: {},
    pinnedStates: {},
    zIndexOrder: [],
    rootHydrationRequestCounter: 0,
    nestedHydrationRequestCounters: {},
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
    zIndexBaseMap: {},
    allowDragWhenPinned: true,
    allowDragWhenUnpinned: true,
    focusLockOptions: null,
  };
}
