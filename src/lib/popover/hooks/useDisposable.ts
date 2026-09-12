/**
 * React 19 Lifecycle Bridge for Explicit Resource Management.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useDisposable
 */

import { useEffect, useRef, type DependencyList } from 'react';
import { CompositeDisposable } from '../utils/resource/compositeDisposable';
import { getDisposeMethod, type CleanupItem } from '../utils/resource/disposableTypes';

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

export function useDisposable(factory: () => CleanupItem, deps: DependencyList = []): void {
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

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
