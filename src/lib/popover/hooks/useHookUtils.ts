/**
 * React Hook Utilities for popover-trail.
 * Provides performance-critical ref and callback management primitives.
 *
 * @module useHookUtils
 */

import { useRef, useCallback, type Ref, type RefCallback } from 'react';

/**
 * Merges multiple React refs (callback refs, ref objects, or null/undefined)
 * into a single stable callback ref that never changes identity.
 *
 * @remarks
 * Unlike `useCallback((node) => { ref1(node); ref2(node); }, [ref1, ref2])`,
 * this hook returns a **referentially stable** function. When one of the input
 * refs changes (e.g., a parent passes a new callback ref), the DOM node is NOT
 * detached and reattached — the merge function simply forwards to the latest refs
 * stored in an internal `useRef`.
 *
 * This eliminates layout thrashing (forced style recalculations) caused by
 * unnecessary DOM node detach/reattach cycles during parent re-renders.
 *
 * @template T - The DOM element type.
 * @param refs - Spread array of React refs to merge.
 * @returns A single stable callback ref that forwards to all input refs.
 *
 * @example
 * ```tsx
 * const mergedRef = useMergedRef(internalRef, externalRef, floatingRef);
 * return <div ref={mergedRef} />;
 * ```
 */
export function useMergedRef<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  const refsRef = useRef(refs);
  refsRef.current = refs;

  return useCallback((node: T | null) => {
    for (const ref of refsRef.current) {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        (ref as { current: T | null }).current = node;
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
 * `useStableCallback` wraps the handler in a `useRef` that is updated on every
 * render, and returns a static wrapper function (empty `[]` dependency array)
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
  ref.current = fn;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    // Type assertion: wrapping dynamic closure to match original stable function signature
    ((...args: Parameters<T>) => ref.current(...args)) as unknown as T,
    [],
  );
}
