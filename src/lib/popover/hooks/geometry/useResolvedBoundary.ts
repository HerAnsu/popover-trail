/**
 * Hook to lazily or dynamically resolve Floating UI boundary elements.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/geometry/useResolvedBoundary
 */

import { useEffect, useState } from 'react';
import type { Boundary } from '@floating-ui/react';
import { wrapResult, isOk } from '../../utils/result';
import { isFunction } from '../../utils/typeGuards';

/**
 * Resolves a Floating UI clipping boundary, evaluating getter functions lazily.
 *
 * @param boundary - Static boundary element, clipping rect, or dynamic getter function.
 * @returns Resolved Boundary element or undefined.
 *
 * @example
 * ```tsx
 * const boundary = useResolvedBoundary(() => document.getElementById('scroll-container'));
 * ```
 */
export function useResolvedBoundary(
  boundary?: Boundary | (() => Boundary | null | undefined),
): Boundary | undefined {
  const [resolvedBoundary, setResolvedBoundary] = useState<Boundary | undefined>(
    !isFunction(boundary) ? boundary : undefined,
  );

  useEffect(() => {
    if (isFunction(boundary)) {
      const boundaryResult = wrapResult(() => boundary());
      if (isOk(boundaryResult) && boundaryResult.data) {
        setResolvedBoundary(boundaryResult.data);
      }
    } else {
      setResolvedBoundary(boundary);
    }
  }, [boundary]);

  return resolvedBoundary;
}
