/**
 * React Hook Utilities for popover-trail.
 * Provides performance-critical ref and callback management primitives.
 *
 * @module useHookUtils
 */

import {
  useRef,
  useCallback,
  useEffect,
  useInsertionEffect,
  type Ref,
  type RefCallback,
  type RefObject,
} from 'react';
import { isReactRefObject } from '../utils/guards/reactGuards';

/**
 * Safely assigns a value to a React ref (either mutable RefObject or RefCallback).
 *
 * @template T - Node element type.
 * @param ref - React ref to assign.
 * @param value - DOM node or value to pass to the ref.
 *
 * @example
 * ```typescript
 * setRef(forwardedRef, node);
 * ```
 */
export function setRef<T>(ref: Ref<T> | undefined | null, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (isReactRefObject<T>(ref)) {
    ref.current = value;
  }
}

/**
 * Composes multiple React refs into a single RefCallback.
 *
 * @template T - Node element type.
 * @param refs - Sequence of refs to merge.
 * @returns Composed callback ref.
 *
 * @example
 * ```typescript
 * const combinedRef = mergeRefs(localRef, forwardedRef);
 * ```
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

/**
 * Merges multiple React refs into a single referentially stable callback ref.
 * Eliminates layout thrashing by avoiding DOM node detach/reattach cycles.
 *
 * @param refs - List of refs to merge.
 * @returns Stable merged callback ref.
 *
 * @example
 * ```tsx
 * function Card({ forwardedRef }: CardProps) {
 *   const localRef = useRef<HTMLDivElement>(null);
 *   const ref = useMergedRef(localRef, forwardedRef);
 *   return <div ref={ref}>Card Content</div>;
 * }
 * ```
 */
export function useMergedRef<T>(...refs: (Ref<T> | undefined | null)[]): RefCallback<T> {
  const refsRef = useRef(refs);

  useInsertionEffect(() => {
    refsRef.current = refs;
  });

  return useCallback((node: T | null) => {
    for (const ref of refsRef.current) {
      setRef(ref, node);
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

/**
 * Returns a ref object that synchronously updates to always hold the latest value.
 *
 * @template T - Value type.
 * @param value - Value to keep track of.
 * @returns Ref containing the latest value.
 *
 * @example
 * ```tsx
 * function EventTrigger({ onClick }: { onClick: () => void }) {
 *   const onClickRef = useLatestRef(onClick);
 *   useEffect(() => {
 *     const timer = setTimeout(() => onClickRef.current(), 1000);
 *     return () => clearTimeout(timer);
 *   }, [onClickRef]);
 * }
 * ```
 */
export function useLatestRef<T>(value: T): RefObject<T> {
  const ref = useRef(value);

  useInsertionEffect(() => {
    ref.current = value;
  });

  return ref;
}

/**
 * Returns a predicate function indicating whether the component is currently mounted.
 * Useful in asynchronous flows to prevent state updates on unmounted components.
 *
 * @returns Stable predicate function returning true if mounted.
 *
 * @example
 * ```tsx
 * function AsyncCard({ loadData }: AsyncCardProps) {
 *   const isMounted = useIsMounted();
 *   const [data, setData] = useState(null);
 *
 *   useEffect(() => {
 *     loadData().then(result => {
 *       if (isMounted()) setData(result);
 *     });
 *   }, [loadData, isMounted]);
 * }
 * ```
 */
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return useCallback(() => isMountedRef.current, []);
}

/**
 * Returns the value from the previous render cycle.
 *
 * @template T - Value type.
 * @param value - Current value to track.
 * @returns Previous value or undefined on the first render cycle.
 *
 * @example
 * ```tsx
 * function Counter({ count }: { count: number }) {
 *   const prevCount = usePrevious(count);
 *   const hasIncreased = prevCount !== undefined && count > prevCount;
 *   return <div>{count} {hasIncreased ? '↑' : ''}</div>;
 * }
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<{ value: T; prev: T | undefined }>({
    value,
    prev: undefined,
  });

  if (ref.current.value !== value) {
    ref.current = {
      value,
      prev: ref.current.value,
    };
  }

  return ref.current.prev;
}

