/* eslint-disable react/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import { createPopoverStore } from './store';
import type {
  PopoverStore,
  PopoverResolver,
  ClickOutsideConfig,
  PopoverCache,
  CollisionConfig,
  OpenRootOptions,
  OpenNestedOptions,
} from './types';

// Instantiate context with any-typed store as fallback
export const PopoverStoreContext = createContext<StoreApi<PopoverStore<any, any>> | null>(null);

export interface PopoverProviderProps<TData = any, TContext = any> {
  children: ReactNode;
  resolveData: PopoverResolver<TData, TContext>;
  initialContext?: TContext;
  clickOutside?: ClickOutsideConfig;
  enableKeyboardClose?: boolean;
  closePinnedDescendants?: boolean;
  cache?: PopoverCache<TData>;
  collision?: CollisionConfig;
}

/**
 * Provider component to instantiate and inject the generic Popover state store.
 */
export function PopoverProvider<TData = any, TContext = any>({
  children,
  resolveData,
  initialContext,
  clickOutside,
  enableKeyboardClose = true,
  closePinnedDescendants = false,
  cache,
  collision,
}: PopoverProviderProps<TData, TContext>) {
  // Use useState to instantiate the store once
  const [store] = useState(() =>
    createPopoverStore<TData, TContext>(resolveData, initialContext, cache),
  );

  // Synchronize context reactively when the prop changes
  useEffect(() => {
    store.getState().setContext(initialContext as TContext);
  }, [initialContext, store]);

  // Synchronize closePinnedDescendants reactively when the prop changes
  useEffect(() => {
    store.getState().setClosePinnedDescendants(Boolean(closePinnedDescendants));
  }, [closePinnedDescendants, store]);

  // Synchronize collisionConfig reactively when the prop changes
  useEffect(() => {
    store.getState().setCollisionConfig(collision ?? null);
  }, [collision, store]);

  // Cleanup on Provider unmount: abort all in-flight requests and reset state
  useEffect(() => {
    return () => {
      store.getState().destroy();
    };
  }, [store]);

  // Handle Escape key closing globally (WAI-ARIA Accessibility compliance & single listener consolidation)
  useEffect(() => {
    if (!enableKeyboardClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const state = store.getState();
        const hasActive = state.trail.length > 0 || state.floating.length > 0;
        if (hasActive) {
          state.closeTopmost();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardClose, store]);

  // Setup click outside logic if enabled
  const enabled = clickOutside?.enabled;
  const ignoreClass = clickOutside?.ignoreClass;
  const popoverSelector = clickOutside?.popoverSelector ?? '.popover-card';

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const state = store.getState();

      if (state.trail.length === 0) return;

      // If click target is inside any active popover card, ignore
      if (target.closest(popoverSelector)) {
        return;
      }

      // If click target has the ignoreClass, ignore
      if (ignoreClass) {
        try {
          if (target.closest(`.${CSS.escape(ignoreClass)}`)) {
            return;
          }
        } catch {
          // Fallback: CSS.escape not available in older environments
          if (target.closest(`.${ignoreClass}`)) {
            return;
          }
        }
      }

      // If click target is the anchor element itself, ignore
      if (state.anchorElement && state.anchorElement.contains(target)) {
        return;
      }

      // Click is outside, clear the active trail!
      state.clearTrail();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [enabled, ignoreClass, popoverSelector, store]);

  return (
    <PopoverStoreContext.Provider value={store as any}>{children}</PopoverStoreContext.Provider>
  );
}

/**
 * Custom selector hook for direct access to the Zustand Popover Store.
 */
export function usePopoverStore<TData = any, TContext = any, TSelected = any>(
  selector: (state: PopoverStore<TData, TContext>) => TSelected,
): TSelected {
  const store = useContext(PopoverStoreContext);
  if (!store) {
    throw new Error('usePopoverStore must be used within a PopoverProvider');
  }
  return useStore(store, selector);
}

/**
 * Hook to retrieve the active trailing popover entries stack.
 */
export function usePopoverTrail<TData = any>() {
  return usePopoverStore<TData>((state) => state.trail);
}

/**
 * Hook to retrieve the active floating popover entries list.
 */
export function usePopoverFloating<TData = any>() {
  return usePopoverStore<TData>((state) => state.floating);
}

/**
 * Hook to retrieve coordinate offsets of all active popovers.
 */
export function usePopoverOffsets() {
  return usePopoverStore((state) => state.offsets);
}

/**
 * Hook to retrieve the pinning state of a specific popover.
 */
export function useIsPopoverPinned(key: string) {
  return usePopoverStore((state) => state.pinnedStates[key] ?? false);
}

/**
 * Hook to retrieve a popover entry (either trailing or floating) by its unique key ID.
 */
export function usePopoverEntry<TData = any>(key: string) {
  return usePopoverStore<TData>(
    (state) => state.floating.find((e) => e.key === key) ?? state.trail.find((e) => e.key === key),
  );
}

/**
 * Hook to retrieve the z-index stack position index of a popover.
 */
export function usePopoverZIndex(key: string) {
  return usePopoverStore((state) => state.zIndexOrder.indexOf(key));
}

/**
 * Hook to verify if a popover is currently focused and at the top of the z-index stack.
 */
export function useIsPopoverTopMost(key: string) {
  return usePopoverStore(
    (state) =>
      state.zIndexOrder.length > 0 && state.zIndexOrder[state.zIndexOrder.length - 1] === key,
  );
}

const DEFAULT_OFFSET = { x: 0, y: 0 };

/**
 * Hook to retrieve the coordinate offset of a specific popover.
 */
export function usePopoverOffset(key: string) {
  return usePopoverStore((state) => state.offsets[key] ?? DEFAULT_OFFSET);
}

/**
 * Hook to retrieve global context value.
 */
export function usePopoverContext<TContext = any>() {
  return usePopoverStore<any, TContext>((state) => state.context);
}

/**
 * Hook to retrieve global collision boundary settings.
 */
export function usePopoverCollisionConfig() {
  return usePopoverStore((state) => state.collisionConfig);
}

/**
 * Hook to retrieve popover store action methods.
 */
export function usePopoverActions<TData = any, TContext = any>() {
  const store = useContext(PopoverStoreContext);
  if (!store) {
    throw new Error('usePopoverActions must be used within a PopoverProvider');
  }
  return useMemo(
    () =>
      store.getState().actions as Omit<
        PopoverStore<TData, TContext>['actions'],
        | 'setContext'
        | 'setOwnerId'
        | 'openRoot'
        | 'pushNested'
        | 'destroy'
        | 'setClosePinnedDescendants'
        | 'setCollisionConfig'
      >,
    [store],
  );
}

/**
 * Hook to simplify binding a button or element trigger to open a root popover on click.
 */
export function usePopoverTrigger(key: string, options?: OpenRootOptions) {
  const actions = usePopoverActions();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      void actions.openRootWithResolver(key, e, optionsRef.current);
    },
    [actions, key],
  );
  return useMemo(() => ({ onClick }), [onClick]);
}

/**
 * Hook to simplify binding a button or element trigger to open a nested child popover on click.
 */
export function usePopoverNestedTrigger(
  key: string,
  sourceKey: string,
  options?: OpenNestedOptions,
) {
  const actions = usePopoverActions();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const onClick = useCallback(
    (_e: React.MouseEvent<HTMLElement>) => {
      void actions.openNestedWithResolver(key, sourceKey, optionsRef.current);
    },
    [actions, key, sourceKey],
  );
  return useMemo(() => ({ onClick }), [onClick]);
}

/**
 * Portal wrapper component to safely mount children popovers to document.body,
 * bypassing any parent overflow: hidden clipping issues.
 */
export function PopoverPortal({
  children,
  container,
}: {
  children: ReactNode;
  container?: HTMLElement;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, container ?? document.body);
}
