/**
 * React Hook Utilities for popover-trail.
 * Provides performance-critical ref and callback management primitives.
 *
 * @module useHookUtils
 */

import { useRef, useCallback, useInsertionEffect, type Ref, type RefCallback } from 'react';
import { isReactRefObject } from '../utils/guards/reactGuards';

/**
 * Merges multiple React refs into a single referentially stable callback ref.
 * Eliminates layout thrashing by avoiding DOM node detach/reattach cycles.
 */
export function useMergedRef<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  const refsRef = useRef(refs);

  useInsertionEffect(() => {
    refsRef.current = refs;
  });

  return useCallback((node: T | null) => {
    for (const ref of refsRef.current) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (isReactRefObject<T>(ref)) {
        ref.current = node;
      }
    }
  }, []);
}

/**
 * Returns a referentially stable callback function whose implementation
 * always points to the latest closure (Event Ref / useEvent polyfill pattern).
 *
 * @remarks
 * Standard `useCallback` recreates the function identity when any dependency
 * changes, which cascades unnecessary re-renders through `React.memo` boundaries.
 *
 * `useStableCallback` wraps the handler in a `useRef` that is updated in `useInsertionEffect`,
 * and returns a static wrapper function (empty `[]` dependency array)
 * that delegates to `ref.current`. The returned function **never changes identity**
 * for the entire component lifecycle.
 *
 * **Important**: Do not use this for callbacks passed to `useEffect` dependencies —
 * the effect would never re-run. Use only for event handlers (onClick, onMouseEnter, etc.).
 *
 * @template T - The function type.
 * @param fn - The latest callback implementation.
 * @returns A referentially stable function that delegates to the latest `fn`.
 *
 * @example
 * ```tsx
 * const handleClick = useStableCallback((e: MouseEvent) => {
 *   // Always has access to latest props/state via closure
 *   actions.closeByKey(currentKey);
 * });
 * // handleClick identity never changes → React.memo children won't re-render
 * ```
 */
export function useStableCallback<T extends (...args: never[]) => unknown>(fn: T): T {
  const ref = useRef(fn);

  useInsertionEffect(() => {
    ref.current = fn;
  });

  return useCallback(((...args: Parameters<T>) => ref.current(...args)) as T, []);
}
