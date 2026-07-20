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
  PopoverDisplayOptions,
  OpenRootOptions,
  OpenNestedOptions,
  TrailEntry,
  UsePopoverResult,
  AnchorEventLike,
} from './types';

/**
 * Context container holding the Zustand StoreApi instance.
 *
 * @internal
 */
export const PopoverStoreContext = createContext<StoreApi<PopoverStore> | null>(null);

/**
 * Context container holding the current Popover card's unique key ID.
 * Used by `<PopoverTrigger>` components to detect if they are nested and resolve
 * their parent popover key automatically.
 */
export const PopoverCardContext = createContext<string | null>(null);

/**
 * Props for the {@link PopoverProvider} component.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 */
export interface PopoverProviderProps<TData = unknown, TContext = unknown> {
  /** React child elements rendered inside the provider. */
  children: ReactNode;

  /**
   * The resolver callback responsible for loading data for each popover.
   * Can resolve data synchronously or asynchronously.
   */
  resolveData: PopoverResolver<TData, TContext>;

  /** Optional initial context values passed to the data resolver. */
  initialContext?: TContext;

  /** Click outside configuration settings (enabled by default). */
  clickOutside?: ClickOutsideConfig;

  /** If true (default), enables closing topmost active popovers on Escape keydown. */
  enableKeyboardClose?: boolean;

  /**
   * If true, closing a parent popover will also recursively close all of its pinned descendants.
   * Defaults to false (pinned descendants remain open).
   */
  closePinnedDescendants?: boolean;

  /** Optional custom synchronous or asynchronous cache provider. */
  cache?: PopoverCache<TData>;

  /** Global default settings for boundary collision checking. */
  collision?: CollisionConfig;

  /** If true, enables keyboard arrow key navigation (default: true). */
  enableArrowNavigation?: boolean;

  /** If true, prints Zustand state updates to the console (default: false). */
  debug?: boolean;

  /** Horizontal offset step applied per level of the cascade trail (default: 8px). */
  cascadeOffsetStep?: number;

  /** Duration of the exit transition in milliseconds before the card is unmounted (default: 0). */
  exitTransitionDuration?: number;

  /** Default distance gap offset override from trigger in pixels (default: 8px). */
  defaultOffset?: number;

  /** Base z-index offset applied to all popover layers (default: 1000). */
  baseZIndex?: number;

  /** Global default CSS animation class applied during mounting (default: 'mounting'). */
  mountingClassName?: string;

  /** Global default CSS animation class applied during unmounting (default: 'unmounting'). */
  unmountingClassName?: string;

  /** Global default CSS animation class applied during mounted (default: 'mounted'). */
  mountedClassName?: string;
}

/**
 * PopoverProvider component that instantiates the Zustand store and injects it
 * into the React context tree.
 *
 * @remarks
 * Instantiates the store once using `useState` and manages global event listeners for
 * Escape key closings (consolidated to avoid event duplication) and click-outside closures.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 *
 * @param props - Provider configuration properties.
 * @returns The provider element wrapping children.
 */
export function PopoverProvider<TData = unknown, TContext = unknown>({
  children,
  resolveData,
  initialContext,
  clickOutside,
  enableKeyboardClose = true,
  closePinnedDescendants = false,
  cache,
  collision,
  enableArrowNavigation = true,
  debug = false,
  cascadeOffsetStep = 8,
  exitTransitionDuration = 0,
  defaultOffset = 8,
  baseZIndex = 1000,
  mountingClassName = 'mounting',
  unmountingClassName = 'unmounting',
  mountedClassName = 'mounted',
}: PopoverProviderProps<TData, TContext>) {
  // Use useState to instantiate the store once
  const [store] = useState(() =>
    createPopoverStore<TData, TContext>(resolveData, initialContext, cache),
  );

  // Synchronize all provider props to the store in a single effect to avoid
  // 10 separate render cycles when multiple props change simultaneously
  useEffect(() => {
    const state = store.getState();
    state.setEnableArrowNavigation(Boolean(enableArrowNavigation));
    state.setDebug(Boolean(debug));
    state.setCascadeOffsetStep(Number(cascadeOffsetStep));
    state.setExitTransitionDuration(Number(exitTransitionDuration));
    state.setDefaultOffset(Number(defaultOffset));
    state.setBaseZIndex(Number(baseZIndex));
    state.setGlobalAnimationClassNames(
      String(mountingClassName),
      String(unmountingClassName),
      String(mountedClassName),
    );
    state.setContext(initialContext as TContext);
    state.setResolveData(resolveData);
    state.setClosePinnedDescendants(Boolean(closePinnedDescendants));
    state.setCollisionConfig(collision ?? null);
  }, [
    enableArrowNavigation,
    debug,
    cascadeOffsetStep,
    exitTransitionDuration,
    defaultOffset,
    baseZIndex,
    mountingClassName,
    unmountingClassName,
    mountedClassName,
    initialContext,
    resolveData,
    closePinnedDescendants,
    collision,
    store,
  ]);

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

    const escapedIgnoreClass = ignoreClass ? `.${CSS.escape(ignoreClass)}` : null;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const state = store.getState();

      if (state.trail.length === 0) return;

      // Use composedPath to handle detached DOM nodes correctly
      const path = e.composedPath ? e.composedPath() : [];
      const clickedInside = path.some((el) => {
        if (el instanceof HTMLElement) {
          try {
            if (el.matches(popoverSelector)) return true;
            if (escapedIgnoreClass && el.matches(escapedIgnoreClass)) return true;
          } catch {
            if (ignoreClass && el.classList.contains(ignoreClass)) return true;
          }
        }
        return false;
      });

      if (clickedInside) return;

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
    <PopoverStoreContext.Provider value={store as unknown as StoreApi<PopoverStore>}>
      {children}
    </PopoverStoreContext.Provider>
  );
}

/**
 * Custom selector hook for direct access to reactive slices of the Popover Zustand store.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @template TSelected - The selected slice type.
 *
 * @param selector - Selector function extracting values from state.
 * @returns The reactive value slice.
 * @throws {Error} If called outside a PopoverProvider.
 */
export function usePopoverStore<TSelected, TData = unknown, TContext = unknown>(
  selector: (state: PopoverStore<TData, TContext>) => TSelected,
): TSelected {
  const store = useContext(PopoverStoreContext);
  if (!store) {
    throw new Error('usePopoverStore must be used within a PopoverProvider');
  }
  return useStore(store, selector as (state: PopoverStore) => TSelected);
}

/**
 * Hook to retrieve the raw store API instance directly, without subscribing to state changes.
 * Useful for performance-sensitive imperative writes (e.g. inside drag events).
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 *
 * @returns The raw Zustand StoreApi instance.
 * @throws {Error} If called outside a PopoverProvider.
 */
export function usePopoverStoreApi<TData = unknown, TContext = unknown>() {
  const store = useContext(PopoverStoreContext);
  if (!store) {
    throw new Error('usePopoverStoreApi must be used within a PopoverProvider');
  }
  return store as unknown as StoreApi<PopoverStore<TData, TContext>>;
}

/**
 * Hook to retrieve the active trailing popover entries stack.
 *
 * @template TData - The type of resolved data payloads.
 * @returns Array of active trailing popover entries.
 */
export function usePopoverTrail<TData = unknown>(): readonly TrailEntry<TData>[] {
  return usePopoverStore((state: PopoverStore<TData>) => state.trail);
}

/**
 * Hook to retrieve the active floating (pinned) popover entries list.
 *
 * @template TData - The type of resolved data payloads.
 * @returns Array of floating popover entries.
 */
export function usePopoverFloating<TData = unknown>(): readonly TrailEntry<TData>[] {
  return usePopoverStore((state: PopoverStore<TData>) => state.floating);
}

/**
 * Hook to retrieve coordinate offsets of all active popovers.
 *
 * @returns Record of offset coordinate objects mapped by popover key.
 */
export function usePopoverOffsets() {
  return usePopoverStore((state) => state.offsets);
}

/**
 * Hook to retrieve the pinning state of a specific popover.
 *
 * @param key - The unique identifier key of the popover.
 * @returns True if the popover is currently pinned/floating.
 */
export function useIsPopoverPinned(key: string) {
  return usePopoverStore((state) => state.pinnedStates[key] ?? false);
}

/**
 * Hook to retrieve a popover entry (either trailing or floating) by its unique key ID.
 *
 * @template TData - The type of resolved data payloads.
 * @param key - The unique identifier key of the popover.
 * @returns The matching TrailEntry or undefined if not found.
 */
export function usePopoverEntry<TData = unknown>(key: string): TrailEntry<TData> | undefined {
  return usePopoverStore(
    (state: PopoverStore<TData>) =>
      state.floating.find((e) => e.key === key) ?? state.trail.find((e) => e.key === key),
  );
}

/**
 * Hook to retrieve the z-index stack position index of a popover.
 *
 * @param key - The unique identifier key of the popover.
 * @returns The 0-based z-index depth index, or -1 if not found.
 */
export function usePopoverZIndex(key: string) {
  return usePopoverStore((state) => state.zIndexOrder.indexOf(key));
}

/**
 * Hook to verify if a popover is currently focused and at the top of the z-index stack.
 *
 * @param key - The unique identifier key of the popover.
 * @returns True if the popover is topmost.
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
 *
 * @param key - The unique identifier key of the popover.
 * @returns The coordinate offset object.
 */
export function usePopoverOffset(key: string) {
  return usePopoverStore((state) => state.offsets[key] ?? DEFAULT_OFFSET);
}

/**
 * Hook to retrieve the global context value.
 *
 * @template TContext - The type of context.
 * @returns The active context object.
 */
export function usePopoverContext<TContext = unknown>() {
  return usePopoverStore((state: PopoverStore<unknown, TContext>) => state.context);
}

/**
 * Hook to retrieve the global collision boundary settings.
 *
 * @returns The collision configuration object.
 */
export function usePopoverCollisionConfig() {
  return usePopoverStore((state) => state.collisionConfig);
}
/**
 * Hook to check if a specific popover key is currently open (exists in trail or floating lists).
 *
 * @param key - The unique identifier key of the popover.
 * @returns True if the popover is active and open.
 */
export function useIsPopoverOpen(key: string): boolean {
  return usePopoverStore(
    useCallback(
      (state: PopoverStore) =>
        state.trail.some((e) => e.key === key) || state.floating.some((e) => e.key === key),
      [key],
    ),
  );
}
/**
 * Hook to retrieve public popover store action dispatch methods.
 *
 * @remarks
 * Excludes internal state lifecycle actions like `openRoot` and `destroy`.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @returns Object containing dispatch actions.
 */
export function usePopoverActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(): Readonly<PopoverStore<TData, TContext, TPopoverKey>['actions']> {
  const store = useContext(PopoverStoreContext);
  if (!store) {
    throw new Error('usePopoverActions must be used within a PopoverProvider');
  }
  return store.getState().actions as Readonly<
    PopoverStore<TData, TContext, TPopoverKey>['actions']
  >;
}

/**
 * A unified selector hook that provides all data, loading status, active states,
 * and dispatch actions needed to interact with a specific popover card.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 *
 * @param key - The unique identifier key of the popover.
 * @returns Unified data values and action wrappers.
 */
export function usePopover<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(key: TPopoverKey): UsePopoverResult<TData> {
  const entry = usePopoverEntry<TData>(key);
  const isOpen = useIsPopoverOpen(key);
  const isPinned = useIsPopoverPinned(key);
  const zIndex = usePopoverZIndex(key);
  const isTop = useIsPopoverTopMost(key);
  const offset = usePopoverOffset(key);
  const actions = usePopoverActions<TData, TContext>();

  const close = useCallback(() => actions.closeByKey(key, { transition: true }), [actions, key]);
  const pin = useCallback((rect: DOMRect) => actions.togglePin(key, rect), [actions, key]);
  const bringToFront = useCallback(() => actions.bringToFront(key), [actions, key]);
  const updateOffset = useCallback(
    (x: number, y: number) => actions.updateOffset(key, x, y),
    [actions, key],
  );

  return useMemo(
    (): UsePopoverResult<TData> => ({
      entry,
      isOpen,
      isPinned,
      zIndex,
      isTop,
      offset,
      isLoading: entry?.isLoading ?? false,
      data: entry?.data,
      error: entry?.error,
      close,
      pin,
      bringToFront,
      updateOffset,
    }),
    [entry, isOpen, isPinned, zIndex, isTop, offset, close, pin, bringToFront, updateOffset],
  );
}

function usePopoverHoverHandlers(
  key: string,
  openTimerRef: { current: ReturnType<typeof setTimeout> | null },
  optionsRef: { current: PopoverDisplayOptions | undefined },
  onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void,
  onClick: (e: React.MouseEvent<HTMLElement>) => void,
  hoverEnabled: boolean,
) {
  const actions = usePopoverActions();
  const onMouseLeave = useCallback(() => {
    const hoverOpts = optionsRef.current?.hover;
    if (hoverOpts?.enabled) {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
      const delay = hoverOpts.closeDelay ?? 300;
      actions.hoverLeave(key, delay);
    }
  }, [actions, key, optionsRef, openTimerRef]);

  const isOpen = useIsPopoverOpen(key);

  return useMemo(() => {
    const ariaProps = {
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': isOpen,
      'aria-controls': `popover-card-${key}`,
    };
    return {
      ...ariaProps,
      onMouseEnter: hoverEnabled ? onMouseEnter : undefined,
      onMouseLeave: hoverEnabled ? onMouseLeave : undefined,
      onClick,
    };
  }, [onClick, onMouseEnter, onMouseLeave, hoverEnabled, isOpen, key]);
}

/**
 * Hook to track loading/error status and trigger manual data reloads for a popover card.
 *
 * @template TData - The type of resolved data payload.
 * @param key - The unique identifier key of the popover card.
 * @returns Object containing isLoading status, error, and reload trigger callback.
 */
export function usePopoverHydration<TData = unknown>(key: string) {
  const actions = usePopoverActions();
  const entry = usePopoverEntry<TData>(key);
  const reload = useCallback(() => {
    void actions.retryPopover(key);
  }, [actions, key]);

  return {
    isLoading: entry?.isLoading ?? false,
    error: entry?.error ?? null,
    reload,
  };
}

/**
 * Hook to simplify binding an HTML element click trigger to open a root popover.
 *
 * @param key - The unique identifier key for the root popover.
 * @param options - Custom configuration options.
 * @returns Event handler props object (e.g. `{ onClick }`).
 */
export function usePopoverTrigger(key: string, options?: OpenRootOptions) {
  const actions = usePopoverActions();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (optionsRef.current?.hover?.enabled) return;
      void actions.openRootWithResolver(key, e, optionsRef.current);
    },
    [actions, key],
  );

  const onMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const hoverOpts = optionsRef.current?.hover;
      if (hoverOpts?.enabled) {
        if (openTimerRef.current) {
          clearTimeout(openTimerRef.current);
        }
        const currentTarget = e.currentTarget;
        const fakeEvent: AnchorEventLike = {
          currentTarget,
          stopPropagation: () => {
            e.stopPropagation();
          },
        };
        const delay = hoverOpts.openDelay ?? 200;
        openTimerRef.current = setTimeout(() => {
          void actions.openRootWithResolver(key, fakeEvent, optionsRef.current);
        }, delay);
      }
    },
    [actions, key],
  );

  return usePopoverHoverHandlers(
    key,
    openTimerRef,
    optionsRef,
    onMouseEnter,
    onClick,
    Boolean(options?.hover?.enabled),
  );
}

/**
 * Hook to simplify binding an HTML element click trigger to open a nested child popover.
 *
 * @param key - The unique identifier key for the nested popover.
 * @param sourceKey - The unique key of the parent popover spawning this child.
 * @param options - Custom configuration options.
 * @returns Event handler props object (e.g. `{ onClick }`).
 */
export function usePopoverNestedTrigger(
  key: string,
  sourceKey: string,
  options?: OpenNestedOptions,
) {
  const actions = usePopoverActions();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (optionsRef.current?.hover?.enabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      void actions.openNestedWithResolver(key, sourceKey, {
        ...optionsRef.current,
        triggerRect: rect,
      });
    },
    [actions, key, sourceKey],
  );

  const onMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const hoverOpts = optionsRef.current?.hover;
      if (hoverOpts?.enabled) {
        if (openTimerRef.current) {
          clearTimeout(openTimerRef.current);
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const delay = hoverOpts.openDelay ?? 200;
        openTimerRef.current = setTimeout(() => {
          void actions.openNestedWithResolver(key, sourceKey, {
            ...optionsRef.current,
            triggerRect: rect,
          });
        }, delay);
      }
    },
    [actions, key, sourceKey],
  );

  return usePopoverHoverHandlers(
    key,
    openTimerRef,
    optionsRef,
    onMouseEnter,
    onClick,
    Boolean(options?.hover?.enabled),
  );
}

/**
 * Portal wrapper component that safely mounts children elements to `document.body`,
 * bypassing parent `overflow: hidden` layouts and clipping issues.
 *
 * @param props - Portal configuration props.
 * @returns The portal element.
 */
export function PopoverPortal({
  children,
  container,
}: {
  /** React elements to portal. */
  children: ReactNode;
  /** Optional custom DOM element target. Defaults to document.body. */
  container?: HTMLElement | (() => HTMLElement | null) | React.RefObject<HTMLElement | null>;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  let target: HTMLElement | null = null;
  if (container) {
    if (typeof container === 'function') {
      target = container();
    } else if ('current' in container) {
      target = container.current;
    } else {
      target = container;
    }
  }

  return createPortal(children, target ?? document.body);
}
