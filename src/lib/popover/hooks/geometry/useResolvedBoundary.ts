import { useEffect, useState } from 'react';
import type { Boundary } from '@floating-ui/react';
import { wrapResult, isOk } from '../../utils/result';

export function useResolvedBoundary(
  boundary?: Boundary | (() => Boundary | null | undefined),
): Boundary | undefined {
  const [resolvedBoundary, setResolvedBoundary] = useState<Boundary | undefined>(
    typeof boundary !== 'function' ? boundary : undefined,
  );

  useEffect(() => {
    if (typeof boundary === 'function') {
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
