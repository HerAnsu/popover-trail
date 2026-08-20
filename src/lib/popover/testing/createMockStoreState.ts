/**
 * Mock Store State Factory for Unit and Integration Testing in popover-trail.
 * Eliminates double type assertions (`as unknown as PopoverStateData`) in test suites.
 *
 * @module testing/createMockStoreState
 */

import type { PopoverStateData, PopoverResolver, DragOffset } from '../types';
import { EMPTY_OBJECT } from '../store/storeDefaults';

/**
 * Creates a fully initialized, type-safe PopoverStateData fixture with customizable overrides.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @param overrides - Partial state properties to override default fixture values.
 * @returns Fully typed, valid PopoverStateData object.
 */
export function createMockStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  overrides?: Partial<PopoverStateData<TData, TContext, TPopoverKey>>,
): PopoverStateData<TData, TContext, TPopoverKey> {
  return {
    stateRevision: 0,
    trail: [],
    floating: [],
    offsets: EMPTY_OBJECT as Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>,
    pinnedStates: EMPTY_OBJECT as Readonly<Partial<Record<TPopoverKey, boolean>>>,
    zIndexOrder: [],
    ownerId: null,
    anchorElement: null,
    anchorRect: null,
    rootHydrationRequestCounter: 0,
    nestedHydrationRequestCounters: EMPTY_OBJECT as Readonly<Partial<Record<TPopoverKey, number>>>,
    context: null,
    resolveData: (() => Promise.resolve({} as TData)) as PopoverResolver<TData, TContext>,
    cache: null,
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
    responsiveMode: 'auto',
    mobileBreakpoint: 768,
    components: null,
    zIndexBaseMap: null,
    allowDragWhenPinned: true,
    allowDragWhenUnpinned: true,
    focusLockOptions: null,
    ...overrides,
  };
}
