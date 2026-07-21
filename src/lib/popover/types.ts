import type { Placement, Boundary, VirtualElement, flip, shift, size } from '@floating-ui/react';

/**
 * Valid lifecycle transition status values for popover card mounting and unmounting animations.
 */
export type PopoverTransitionStatus = 'mounting' | 'mounted' | 'unmounting';

/**
 * Valid shift directions for cascade stacking offsets.
 */
export type CascadeOffsetDirection = 'left' | 'right' | 'top' | 'bottom' | 'none';

/**
 * Axis locks for drag-and-drop movement constraints.
 */
export type DragAxis = 'x' | 'y' | 'both';

/**
 * Branded string type helper for strict popover keys.
 *
 * @template T - The string key union.
 */
export type PopoverKey<T extends string = string> = T & {
  readonly __popoverKeyBrand?: unique symbol;
};

/**
 * Configuration options for hover triggers and delay buffers.
 */
export interface HoverConfig {
  /** If true, triggers opening/closing on hover. */
  enabled: boolean;
  /** Delay in milliseconds before opening the popover on hover (default: 200). */
  openDelay?: number;
  /** Delay in milliseconds before closing the popover when cursor leaves (default: 300). */
  closeDelay?: number;
  /** If false, the popover card itself will not trigger closing when mouse leaves the card (default: true). */
  closeOnMouseLeave?: boolean;
}

/**
 * Shared display configuration options common to trail entries and open option types.
 */
export interface PopoverDisplayOptions {
  /** Custom boundary collision overrides. */
  collision?: CollisionConfig;
  /** Hover-trigger options configuration overrides. */
  hover?: HoverConfig;
  /** Accessibility description text linked via aria-describedby. */
  ariaDescribedby?: string;
  /** True to allow dragging when the popover card is pinned/floating (default: true). */
  allowDragWhenPinned?: boolean;
  /** True to allow dragging when the popover card is unpinned/trailing (default: true). */
  allowDragWhenUnpinned?: boolean;
  /** Preferred layout placement direction relative to trigger. */
  placement?: PopoverPlacement;
  /** Custom distance gap offset override from trigger in pixels. */
  offset?: number;
  /** Custom exit transition duration override in milliseconds. */
  exitTransitionDuration?: number;
  /** Custom base z-index layering override. */
  baseZIndex?: number;
  /** Custom horizontal/vertical cascade offset step override. */
  cascadeOffsetStep?: number;
  /** Custom cascade stacking offset shift direction override. */
  cascadeOffsetDirection?: CascadeOffsetDirection;
  /** Custom spring tilt effect toggle override. */
  enableTilt?: boolean;
  /** Custom max spring tilt angle override. */
  maxTiltAngle?: number;
  /** Custom spring tilt speed sensitivity override. */
  tiltSensitivity?: number;
  /** Custom lock axis constraints for dragging ('x' | 'y' | 'both'). */
  dragAxis?: DragAxis;
  /** Custom spring tilt friction coefficient (default: 0.95). */
  tiltFriction?: number;
  /** Custom spring tilt inertia decay coefficient (default: 0.82). */
  tiltDecay?: number;
  /** Custom CSS animation class applied during mounting. */
  mountingClassName?: string;
  /** Custom CSS animation class applied during unmounting. */
  unmountingClassName?: string;
  /** Custom CSS animation class applied during mounted. */
  mountedClassName?: string;
  /** Custom button controls and action toggles configuration settings. */
  buttonControls?: ButtonControlConfig;
  /** Isolated UI stack group zone ID (e.g. 'sidebar', 'canvas', 'top-bar'). */
  stackGroup?: string;
  /** Responsive layout transformation mode ('auto' | 'popover' | 'bottom-sheet' | 'modal'). */
  responsiveMode?: PopoverResponsiveMode;
  /** Positioning layout strategy ('floating-ui' | 'fixed-center' | 'docked-bottom' | 'docked-top' | 'custom'). */
  layoutStrategy?: PopoverLayoutStrategy;
  /** Custom keyboard shortcuts handler map for this popover card. */
  keyboardShortcuts?: KeyboardShortcutMap;
  /** WAI-ARIA Focus lock (focus trapping) and accessibility configuration settings. */
  focusLockOptions?: FocusLockOptions;
  /** Lifecycle callback triggered when this popover card finishes resolving and opens. */
  onOpen?: (entry: TrailEntry<unknown>) => void;
  /** Lifecycle callback triggered when this popover card closes. */
  onClose?: (key: string) => void;
  /** Lifecycle callback triggered when this popover card is pinned or unpinned. */
  onPin?: (key: string, isPinned: boolean) => void;
  /** Lifecycle callback triggered when data resolution fails. */
  onError?: (error: Error, key: string) => void;
}

/** Map of base z-index layering depth offsets per stack group ID. */
export type ZIndexBaseMap = Record<string, number>;

/**
 * Global component slots override interface for PopoverProvider.
 */
export interface PopoverSlotComponents {
  /** Custom Pin/Unpin action button component. */
  PinButton?: React.ComponentType<{ isPinned: boolean; onClick: () => void; keyId: string }>;
  /** Custom Close action button component. */
  CloseButton?: React.ComponentType<{ onClick: () => void; keyId: string }>;
  /** Custom Loading spinner component. */
  LoadingSpinner?: React.ComponentType<{ keyId: string }>;
  /** Custom Error fallback component. */
  ErrorFallback?: React.ComponentType<{ error: Error; onRetry: () => void; keyId: string }>;
}

/**
 * Configuration options for WAI-ARIA Focus Lock (Focus Trapping) and accessibility controls.
 */
export interface FocusLockOptions {
  /** If true, enables Focus Lock (focus trapping) inside this popover card (default: false for popovers, true for modals). */
  enabled?: boolean;
  /** Custom CSS selector or callback returning element to auto-focus when opened. */
  autoFocusElement?: string | (() => HTMLElement | null);
  /** If true, restores focus to the previously focused element when closed (default: true). */
  returnFocus?: boolean;
  /** If true, locks body scrolling while active (default: false). */
  lockScroll?: boolean;
}

/** Responsive layout transformation mode. */
export type PopoverResponsiveMode = 'auto' | 'popover' | 'bottom-sheet' | 'modal';

/** Positioning layout strategy. */
export type PopoverLayoutStrategy =
  | 'floating-ui'
  | 'fixed-center'
  | 'docked-bottom'
  | 'docked-top'
  | 'custom';

/** Custom keyboard shortcut map. */
export type KeyboardShortcutMap = Record<string, (key: string) => void>;

/**
 * Configuration options for customizable action controls and button toggles per popover card.
 */
export interface ButtonControlConfig {
  /** If false, disables or hides the pin/unpin action toggle button (default: true). */
  enablePin?: boolean;
  /** If false, disables or hides the close action button (default: true). */
  enableClose?: boolean;
  /** If false, disables or hides the drag handle control button (default: true). */
  enableDrag?: boolean;
  /** Custom action buttons configuration array. */
  customButtons?: ReadonlyArray<{
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    onClick?: (key: string) => void;
  }>;
}

/**
 * Represents a single popover instance within the active trail stack or floating list.
 *
 * @template TData - The type of resolved data payload associated with this popover.
 */
export interface TrailEntry<TData = unknown> extends PopoverDisplayOptions {
  /**
   * Unique identifier for this popover instance.
   * Typically derived from the expression, name, or key of the resolved entity.
   */
  key: string;

  /**
   * Parent popover identifier.
   * Establishes the parent-child linkage tree when popovers are nested.
   */
  parentKey?: string;

  /**
   * Bounding box of the element (e.g. trigger button) that anchored/spawned this popover.
   * Used as the anchor target by Floating UI for relative positioning.
   */
  rect?: DOMRect;

  /**
   * Custom viewport-relative absolute coordinates when the popover is pinned/floating.
   */
  pinnedLayoutPos?: {
    top: number;
    left: number;
  };

  /**
   * The successfully resolved data payload of the popover card.
   */
  data?: TData;

  /**
   * True if the popover is currently performing an asynchronous data resolution.
   */
  isLoading?: boolean;

  /**
   * Contains any error thrown by the data resolver during resolution.
   */
  error?: Error | null;

  /**
   * Stores the original parent key before the popover was pinned.
   * Used to restore the trail tree linkage when unpinning the card.
   */
  originalParentKey?: string;

  /**
   * Stores the original trigger bounding box before the popover was pinned.
   * Used to restore relative trigger geometry when unpinning the card.
   */
  originalRect?: DOMRect;

  /** Transition lifecycle state for animating mount/exit states. */
  transitionStatus?: PopoverTransitionStatus;
}

/**
 * Type Guard function checking if a TrailEntry has finished resolving data successfully.
 * Narrows entry.data to TData (eliminating undefined) within conditional blocks.
 *
 * @template TData - The resolved data payload type.
 * @param entry - The TrailEntry to inspect.
 * @returns True if entry has resolved data without error or loading state.
 */
export function isResolvedEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { data: TData; isLoading: false; error: null } {
  return (
    entry !== undefined && !entry.isLoading && entry.error === null && entry.data !== undefined
  );
}

/**
 * Type Guard checking if a TrailEntry is currently performing data resolution.
 *
 * @template TData - The resolved data payload type.
 * @param entry - The TrailEntry to inspect.
 * @returns True if entry is loading.
 */
export function isLoadingEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { isLoading: true } {
  return entry !== undefined && entry.isLoading === true;
}

/**
 * Type Guard checking if a TrailEntry encountered a resolution error.
 *
 * @template TData - The resolved data payload type.
 * @param entry - The TrailEntry to inspect.
 * @returns True if entry has a non-null Error.
 */
export function isErrorEntry<TData>(
  entry: TrailEntry<TData> | undefined,
): entry is TrailEntry<TData> & { error: Error } {
  return entry !== undefined && entry.error instanceof Error;
}

/**
 * Discriminated union representation of a TrailEntry's asynchronous resolution state.
 *
 * @template TData - The resolved data payload type.
 */
export type PopoverEntryDiscriminatedState<TData = unknown> =
  | { status: 'loading'; isLoading: true; data: undefined; error: null }
  | { status: 'error'; isLoading: false; data: undefined; error: Error }
  | { status: 'success'; isLoading: false; data: TData; error: null };

/**
 * Extracts a discriminated state object from a TrailEntry for pattern matching (`switch (state.status)`).
 *
 * @template TData - The resolved data payload type.
 * @param entry - The TrailEntry to inspect.
 * @returns Discriminated union state object.
 */
export function getEntryState<TData>(
  entry: TrailEntry<TData>,
): PopoverEntryDiscriminatedState<TData> {
  if (entry.isLoading) {
    return { status: 'loading', isLoading: true, data: undefined, error: null };
  }
  if (entry.error) {
    return { status: 'error', isLoading: false, data: undefined, error: entry.error };
  }
  return { status: 'success', isLoading: false, data: entry.data as TData, error: null };
}

/**
 * Utility constructor for creating branded PopoverKey string instances.
 *
 * @template T - The string key type.
 * @param key - The string key value.
 * @returns A branded PopoverKey value.
 */
export function createPopoverKey<T extends string>(key: T): PopoverKey<T> {
  return key as PopoverKey<T>;
}

/**
 * Helper function providing automatic type inference when creating custom PopoverResolver functions.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The external context type.
 * @param resolver - The resolver callback function.
 * @returns The typed PopoverResolver callback.
 */
export function createPopoverResolver<TData = unknown, TContext = unknown>(
  resolver: PopoverResolver<TData, TContext>,
): PopoverResolver<TData, TContext> {
  return resolver;
}

/**
 * A minimal event-like or element-like object accepted by `openRootWithResolver`
 * as the anchor source. Supports Floating UI VirtualElement, React synthetic events, or raw DOM elements.
 */
export type AnchorEventLike =
  | VirtualElement
  | { currentTarget: HTMLElement; stopPropagation?: () => void }
  | { getBoundingClientRect: () => DOMRect; stopPropagation?: () => void };

/**
 * Resolver callback type for lazy-loading/hydrating data for a popover card.
 *
 * @template TData - The type of data resolved by the callback.
 * @template TContext - The type of external global context passed to the resolver.
 * @template TPopoverKey - Union of valid popover keys.
 *
 * @param keyOrName - The unique key or expression to resolve.
 * @param parentData - Resolved data payload of the parent popover (if nested).
 * @param context - External context passed from the PopoverProvider.
 * @param signal - An AbortSignal to cancel in-flight HTTP requests if the popover is closed.
 * @returns The resolved data payload, or a promise/thenable resolving to it.
 *
 * @throws {Error} If data resolution fails.
 */
export type PopoverResolver<TData = unknown, TContext = unknown> = (
  keyOrName: string,
  parentData?: TData,
  context?: TContext,
  signal?: AbortSignal,
) => Promise<TData> | TData;

/**
 * The inner reactive state managed by the popover Zustand store.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface PopoverStateData<TData = unknown, TContext = unknown> {
  /** The stack of active popovers in the current trail path. */
  readonly trail: readonly TrailEntry<TData>[];

  /** Pinned/floating modeless popovers currently placed in the viewport. */
  readonly floating: readonly TrailEntry<TData>[];

  /** Current owner claiming the active trail path. Used to coordinate multiple providers. */
  readonly ownerId: string | null;

  /** Drag-and-drop coordinate offsets relative to initial position, mapped by popover key. */
  readonly offsets: Readonly<Record<string, Readonly<{ x: number; y: number }>>>;

  /** Pinned/floating status mapped by popover key. */
  readonly pinnedStates: Readonly<Record<string, boolean>>;

  /** z-index depth order list of keys (highest/topmost is last). */
  readonly zIndexOrder: readonly string[];

  /** Counter tracking root-level hydration requests to avoid race conditions. */
  readonly rootHydrationRequestCounter: number;

  /** Counters tracking nested hydration requests mapped by parent key. */
  readonly nestedHydrationRequestCounters: Readonly<Record<string, number>>;

  /** The HTML anchor element triggering the root popover. Retained for boundary references. */
  readonly anchorElement: HTMLElement | null;

  /** Bound box rect of the root anchor element. */
  readonly anchorRect: DOMRect | null;

  /** Current external global context values. */
  readonly context: TContext | null;

  /** Whether to recursively close pinned descendants when parent closes. */
  readonly closePinnedDescendants: boolean;

  /** Global collision settings default. */
  readonly collisionConfig: CollisionConfig | null;

  /** Custom data cache provider. */
  readonly cache: PopoverCache<TData> | null;

  /** Active resolver callback. */
  readonly resolveData: PopoverResolver<TData, TContext>;

  /** Whether keyboard arrow navigation is enabled. */
  readonly enableArrowNavigation: boolean;

  /** Whether debug logging is enabled. */
  readonly debug: boolean;

  /** Horizontal offset step applied per level of the cascade trail (default: 8px). */
  readonly cascadeOffsetStep: number;
  /** Duration in milliseconds of the card exit animation before it is removed from DOM (default: 0). */
  readonly exitTransitionDuration: number;
  /** Default distance gap offset from the trigger in pixels (default: 8px). */
  readonly defaultOffset: number;
  /** Base z-index offset applied to all popover layers (default: 1000). */
  readonly baseZIndex: number;
  /** Global default CSS animation class applied during mounting. */
  readonly mountingClassName: string;
  /** Global default CSS animation class applied during unmounting. */
  readonly unmountingClassName: string;
  /** Global default CSS animation class applied during mounted. */
  readonly mountedClassName: string;
  /** Active stack group zone ID filter (e.g. 'sidebar', 'canvas', or null for all). */
  readonly activeStackGroup: string | null;
  /** Global responsive layout transformation mode. */
  readonly responsiveMode: PopoverResponsiveMode;
  /** Mobile viewport width breakpoint in pixels. */
  readonly mobileBreakpoint: number;
  /** Global component slots overrides. */
  readonly components: PopoverSlotComponents | null;
  /** Base z-index depth offsets per stack group ID. */
  readonly zIndexBaseMap: ZIndexBaseMap | null;
}

/**
 * Middleware function intercepting state updates before commit.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Valid popover key union.
 */
export type PopoverMiddleware<
  TData = unknown,
  TContext = unknown,
  _TPopoverKey extends string = string,
> = (
  patch: Partial<PopoverStateData<TData, TContext>>,
  state: PopoverStateData<TData, TContext>,
) => Partial<PopoverStateData<TData, TContext>> | false | void;

/**
 * The dispatch and lifecycle actions exposed by the popover store.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface PopoverActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  /** Updates the shared global context field. */
  setContext: (context: TContext) => void;

  /** Updates the active data resolver. */
  setResolveData: (resolver: PopoverResolver<TData, TContext>) => void;

  /** Updates the owner ID claiming the trail. */
  setOwnerId: (ownerId: string | null) => void;

  /** Spawns a new popover trail root. */
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;

  /** Appends a nested popover after a parent index. */
  pushNested: (index: number, entry: TrailEntry<TData>) => void;

  /** Toggles a popover's pinned status. Moves it between trail and floating lists. */
  togglePin: (key: TPopoverKey, rect?: DOMRect) => void;

  /** Brings a popover and its descendants to the top of the z-index list. */
  bringToFront: (key: TPopoverKey) => void;

  /** Closes all popovers at and after a specific virtual index. */
  closeFrom: (index: number, options?: { transition?: boolean }) => void;

  /** Updates coordinate offsets from drag events. */
  updateOffset: (key: TPopoverKey, x: number, y: number) => void;

  /** Resets state completely, aborting all active requests. */
  clear: () => void;

  /** Clears only the active trail (retains floating ones). */
  clearTrail: () => void;

  /** Closes the topmost active popover based on z-index depth order. */
  closeTopmost: () => void;

  /** Resolves data and opens a root popover. */
  openRootWithResolver: (
    keyOrName: TPopoverKey,
    anchorEvent: AnchorEventLike,
    options?: Readonly<OpenRootOptions>,
  ) => Promise<void>;

  /** Resolves data and opens a nested popover from a source parent popover key. */
  openNestedWithResolver: (
    keyOrName: TPopoverKey,
    sourceKey: TPopoverKey,
    options?: Readonly<OpenNestedOptions>,
  ) => Promise<void>;

  /** Retries resolving data for an active popover that previously failed to load. */
  retryPopover: (key: TPopoverKey) => Promise<void>;

  /** Lifecycle cleanup: aborts all in-flight requests and resets state. */
  destroy: () => void;

  /** Set closePinnedDescendants configuration dynamically. */
  setClosePinnedDescendants: (close: boolean) => void;

  /** Updates the global collision config dynamically. */
  setCollisionConfig: (config: CollisionConfig | null) => void;

  /** Closes a popover by key and cleans up all of its descendants. */
  closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => void;

  /** Set enableArrowNavigation configuration dynamically. */
  setEnableArrowNavigation: (enable: boolean) => void;

  /** Set debug configuration dynamically. */
  setDebug: (debug: boolean) => void;

  /** Handles mouse hover enter events on popovers. */
  hoverEnter: (key: TPopoverKey) => void;

  /** Handles mouse hover leave events on popovers. */
  hoverLeave: (key: TPopoverKey, delay?: number) => void;

  /** Set cascadeOffsetStep configuration dynamically. */
  setCascadeOffsetStep: (step: number) => void;

  /** Updates entry transition status ('mounting' | 'mounted' | 'unmounting'). */
  setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => void;

  /** Set exitTransitionDuration configuration dynamically. */
  setExitTransitionDuration: (duration: number) => void;

  /** Set defaultOffset configuration dynamically. */
  setDefaultOffset: (offset: number) => void;

  /** Set baseZIndex configuration dynamically. */
  setBaseZIndex: (baseZIndex: number) => void;

  /** Set global animation class names dynamically. */
  setGlobalAnimationClassNames: (mounting: string, unmounting: string, mounted: string) => void;

  /** Subscribes an event listener to real-time store lifecycle events. */
  subscribeEvent: (listener: (event: PopoverStoreEvent<TData>) => void) => () => void;

  /** Batches multiple action mutations into a single atomic state update commit. */
  batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => void;

  /** Registers a middleware function to intercept or transform state patches before commit. */
  useMiddleware: (middleware: PopoverMiddleware<TData, TContext, TPopoverKey>) => () => void;

  /** Restores the previous popover state snapshot from history stack. */
  undo: () => void;

  /** Replays the undone popover state snapshot from history stack. */
  redo: () => void;

  /** Returns true if undo history is available. */
  canUndo: () => boolean;

  /** Returns true if redo history is available. */
  canRedo: () => boolean;

  /** Executes an isolated transaction block. Automatically rolls back all state changes if any action fails. */
  transaction: (
    fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => Promise<void> | void,
  ) => Promise<boolean>;

  /** Serializes and persists active pinned popover cards and layout offsets to storage. */
  persistState: (config?: PopoverPersistConfig) => Promise<void>;

  /** Rehydrates persisted popover cards and layout offsets from storage. */
  rehydrateState: (config?: PopoverPersistConfig) => Promise<boolean>;

  /** Configures action button controls and toggle visibility for a specific popover card. */
  setButtonControls: (key: TPopoverKey, controls: ButtonControlConfig) => void;

  /** Toggles individual action control buttons (enablePin | enableClose | enableDrag) for a popover card. */
  toggleButtonControl: (
    key: TPopoverKey,
    control: 'enablePin' | 'enableClose' | 'enableDrag',
    enabled?: boolean,
  ) => void;

  /** Filters active popovers by stack group zone ID (e.g. 'sidebar', 'canvas', or null for all). */
  setStackGroupFilter: (group: string | null) => void;

  /** Configures global responsive mode ('auto' | 'popover' | 'bottom-sheet' | 'modal'). */
  setResponsiveMode: (mode: PopoverResponsiveMode) => void;

  /** Sets base z-index depth offsets per stack group ID. */
  setZIndexBaseMap: (map: ZIndexBaseMap | null) => void;

  /** Configures global component slots overrides. */
  setSlotComponents: (components: PopoverSlotComponents | null) => void;
}

/**
 * Configuration options for state persistence and auto-rehydration.
 */
export interface PopoverPersistConfig {
  /** Storage key ID (default: 'popover_store_state'). */
  key?: string;
  /** Storage adapter engine (default: window.localStorage). */
  storage?: {
    getItem: (key: string) => string | null | Promise<string | null>;
    setItem: (key: string, value: string) => void | Promise<void>;
    removeItem: (key: string) => void | Promise<void>;
  };
  /** Optional filter function selecting which keys to persist. */
  filter?: (key: string) => boolean;
}

/**
 * Event objects emitted by store action lifecycles for monitoring, analytics, and debugging.
 *
 * @template TData - Resolved data payload type.
 */
export type PopoverStoreEvent<TData = unknown> =
  | { type: 'open_root'; key: string; ownerId: string }
  | { type: 'push_nested'; key: string; parentKey?: string }
  | { type: 'close'; keys: string[] }
  | { type: 'pin'; key: string }
  | { type: 'unpin'; key: string }
  | { type: 'resolve_start'; key: string }
  | { type: 'resolve_success'; key: string; data: TData }
  | { type: 'resolve_error'; key: string; error: Error }
  | { type: 'clear' };

/**
 * Complete representation of the Popover Zustand store state and actions.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @template TPopoverKey - Union of valid popover keys.
 */
export type PopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext> &
  PopoverActions<TData, TContext, TPopoverKey> & {
    actions: PopoverActions<TData, TContext, TPopoverKey>;
  };

/**
 * Valid relative placements supported by Floating UI.
 */
export type PopoverPlacement = 'auto' | Placement;

/**
 * Configuration options for custom click outside behaviors.
 */
export interface ClickOutsideConfig {
  /** If false, disables the click outside detection. */
  enabled?: boolean;

  /** Classname indicating DOM nodes that should not trigger click-outside closure. */
  ignoreClass?: string;

  /** CSS selector used to identify popover card elements (default: '.popover-card'). */
  popoverSelector?: string;
}

/**
 * Interface definition for a generic synchronous/asynchronous cache provider.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface PopoverCache<TData = unknown, TPopoverKey extends string = string> {
  /** Retrieves a cached entry. Can return the value directly or a Promise. */
  get: (key: TPopoverKey) => Promise<TData | undefined> | TData | undefined;

  /** Saves data in the cache. */
  set: (key: TPopoverKey, data: TData) => Promise<void> | void;

  /** Removes a specific item from the cache. */
  delete: (key: TPopoverKey) => Promise<void> | void;

  /** Clears the cache completely. */
  clear: () => Promise<void> | void;

  /** Checks if a non-expired cached entry exists for key. */
  has?: (key: TPopoverKey) => Promise<boolean> | boolean;

  /** Sweeps and purges expired records. */
  pruneExpired?: () => Promise<void> | void;
}

/**
 * Boundary collision settings used by Floating UI shift/flip middleware.
 */
export interface CollisionConfig {
  /**
   * DOM element(s) to constrain the popover within (default: 'clippingAncestors').
   * Can be a function returned at runtime (lazy resolution).
   */
  boundary?: Boundary | (() => Boundary | null);

  /** Safety padding margin around the boundary (default: 12 for shift, 0 for flip). */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  /** Toggle or configure the Floating UI flip middleware (default: true). */
  flip?: boolean | Parameters<typeof flip>[0];
  /** Toggle or configure the Floating UI shift middleware (default: true). */
  shift?: boolean | Parameters<typeof shift>[0];
  /** Toggle or configure the Floating UI size middleware (default: false). */
  size?: boolean | Parameters<typeof size>[0];
}

/**
 * Options configuration for spawning root popovers.
 */
export interface OpenRootOptions extends PopoverDisplayOptions {
  /** Optional custom owner identifier claiming the trail. */
  ownerId?: string;
}

/**
 * Options configuration for spawning nested popovers.
 */
export interface OpenNestedOptions extends PopoverDisplayOptions {
  /** Bounding box of the nested trigger element. */
  triggerRect?: DOMRect;
}

/**
 * Result object returned by the unified `usePopover` hook.
 *
 * @template TData - The resolved data payload type.
 */
export interface UsePopoverResult<TData> {
  /** The full active trail entry data object, or undefined if not found. */
  entry: TrailEntry<TData> | undefined;
  /** True if the popover is currently open. */
  isOpen: boolean;
  /** True if the popover is pinned/floating. */
  isPinned: boolean;
  /** The 0-based depth z-index index of the popover. */
  zIndex: number;
  /** True if the popover is currently at the top of the z-index stack. */
  isTop: boolean;
  /** The viewport-relative coordinate offset of the popover. */
  offset: { x: number; y: number };
  /** True if the popover is currently resolving its data asynchronously. */
  isLoading: boolean;
  /** The successfully resolved data payload. */
  data: TData | undefined;
  /** Mapped error object if resolution failed. */
  error: Error | null | undefined;
  /** Closes this popover card. */
  close: () => void;
  /** Modelessly pins the card at its current trigger coordinates. */
  pin: (rect: DOMRect) => void;
  /** Brings the card to the front of the stacking context. */
  bringToFront: () => void;
  /** Sets custom coordinate dragging offsets on the card. */
  updateOffset: (x: number, y: number) => void;
}
