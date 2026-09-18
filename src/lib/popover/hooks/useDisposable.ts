/**
 * React 19 Lifecycle Bridge for Explicit Resource Management.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useDisposable
 */

import { useEffect, useRef, type DependencyList } from 'react';
import { CompositeDisposable } from '../utils/resource/compositeDisposable';
import { getDisposeMethod, type CleanupItem } from '../utils/resource/disposableTypes';
import { useLatestRef } from './useHookUtils';

/**
 * Returns a stable `CompositeDisposable` instance tied to the hosting component lifecycle.
 * Automatically disposes all registered subscriptions and resources upon component unmount.
 *
 * @example
 * ```tsx
 * const disposables = useCompositeDisposable();
 * useEffect(() => {
 *   disposables.add(store.subscribe(handleChange));
 * }, [store, disposables]);
 * ```
 *
 * @returns Stable CompositeDisposable container.
 */
export function useCompositeDisposable(): CompositeDisposable {
  const containerRef = useRef<CompositeDisposable | null>(null);
  if (!containerRef.current) {
    containerRef.current = new CompositeDisposable();
  }

  useEffect(() => {
    return () => {
      containerRef.current?.dispose();
    };
  }, []);

  return containerRef.current;
}

/**
 * Executes a resource factory and registers the returned disposable resource or cleanup function
 * for deterministic disposal when dependencies change or the component unmounts.
 *
 * @param factory - Factory function returning a disposable object, [Symbol.dispose] provider, or cleanup callback.
 * @param deps - React dependency list.
 *
 * @example
 * ```tsx
 * useDisposable(() => {
 *   const timer = setInterval(tick, 1000);
 *   return () => clearInterval(timer);
 * }, []);
 * ```
 */
export function useDisposable(factory: () => CleanupItem, deps: DependencyList = []): void {
  const factoryRef = useLatestRef(factory);

  useEffect(() => {
    const item = factoryRef.current();
    return () => {
      if (typeof item === 'function') {
        item();
      } else if (item) {
        const fn = getDisposeMethod(item);
        fn?.();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
