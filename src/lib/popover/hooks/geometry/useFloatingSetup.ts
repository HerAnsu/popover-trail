/**
 * Floating Setup Hooks and Coordination.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/geometry/useFloatingSetup
 */

import { useMemo } from 'react';
import {
  useFloating,
  offset,
  flip,
  shift,
  size,
  autoUpdate,
  type Placement,
} from '@floating-ui/react';
import type { PopoverRect } from '../../types';
import { usePopoverStore } from '../../context/usePopoverStore';
import { shallowEqual } from '../../utils/equality';
import { resolveAutoPlacement } from './geometryUtils';

export * from './floatingMiddleware';
export * from './floatingObserver';

/**
 * Reads geometry configuration options from the popover store slice with shallow equality.
 *
 * @returns Object with `cascadeOffsetStep`, `defaultOffset`, `responsiveMode`, and `mobileBreakpoint`.
 *
 * @example
 * ```tsx
 * const { cascadeOffsetStep, defaultOffset } = useGeometryStoreConfig();
 * ```
 */
export function useGeometryStoreConfig() {
  return usePopoverStore(
    (state) => ({
      cascadeOffsetStep: state.cascadeOffsetStep,
      defaultOffset: state.defaultOffset,
      responsiveMode: state.responsiveMode,
      mobileBreakpoint: state.mobileBreakpoint,
    }),
    shallowEqual,
  );
}

/**
 * Initializes and coordinates Floating UI hooks with auto-placement heuristics and auto-updating.
 *
 * @param placement - Preferred placement or 'auto'.
 * @param anchorRect - Virtual or DOM anchor rectangle.
 * @param isPinned - Whether card is pinned (disables autoUpdate).
 * @param middleware - Array of configured Floating UI middleware.
 * @returns Floating UI hook result augmented with `resolvedAutoPlacement`.
 *
 * @example
 * ```tsx
 * const { refs, x, y, update, placement } = usePopoverFloatingSetup(
 *   'auto',
 *   anchorRect,
 *   false,
 *   middlewareList,
 * );
 * ```
 */
export function usePopoverFloatingSetup(
  placement: Placement | 'auto' | undefined,
  anchorRect: DOMRect | PopoverRect | null | undefined,
  isPinned: boolean | undefined,
  middleware: Array<
    | ReturnType<typeof offset>
    | ReturnType<typeof flip>
    | ReturnType<typeof shift>
    | ReturnType<typeof size>
  >,
) {
  const resolvedAutoPlacement = useMemo(
    () => resolveAutoPlacement(placement, anchorRect),
    [placement, anchorRect],
  );

  const floating = useFloating({
    placement: resolvedAutoPlacement ?? 'bottom',
    whileElementsMounted: isPinned ? undefined : autoUpdate,
    middleware,
  });

  return { ...floating, resolvedAutoPlacement };
}
