import { useEffect, useState } from 'react';
import type { Boundary } from '@floating-ui/react';

export function useResolvedBoundary(
  boundary?: Boundary | (() => Boundary | null | undefined),
): Boundary | undefined {
  const [resolvedBoundary, setResolvedBoundary] = useState<Boundary | undefined>(
    typeof boundary !== 'function' ? boundary : undefined,
  );

  useEffect(() => {
    if (typeof boundary === 'function') {
      try {
        const el = boundary();
        if (el) {
          setResolvedBoundary(el);
        }
      } catch {
        // Fail-safe for early mount phases where DOM nodes might not be created yet
      }
    } else {
      setResolvedBoundary(boundary);
    }
  }, [boundary]);

  return resolvedBoundary;
}
