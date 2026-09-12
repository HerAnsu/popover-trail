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
import { calculateAutoPlacement } from './geometryUtils';

export * from './floatingMiddleware';
export * from './floatingObserver';

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
    () => calculateAutoPlacement(placement, anchorRect),
    [placement, anchorRect],
  );

  const floating = useFloating({
    placement: resolvedAutoPlacement ?? 'bottom',
    whileElementsMounted: isPinned ? undefined : autoUpdate,
    middleware,
  });

  return { ...floating, resolvedAutoPlacement };
}
