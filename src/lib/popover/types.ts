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
 * Represents a single popover instance within the active trail stack or floating list.
 *
 * @template TData - The type of resolved data payload associated with this popover.
 */
export interface TrailEntry<TData = unknown> {
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

  /**
   * Local overrides for boundary collision settings and safety padding.
   */
  collision?: CollisionConfig;

  /** Hover-trigger options configuration stored for this entry. */
  hover?: HoverConfig;

  /** Accessibility description text linked via aria-describedby. */
  ariaDescribedby?: string;

  /** True to allow dragging even when the popover is unpinned/trailing. */
  allowDragWhenUnpinned?: boolean;
  /** Preferred layout placement direction relative to trigger. */
  placement?: PopoverPlacement;
  /** Transition lifecycle state for animating mount/exit states. */
  transitionStatus?: 'mounting' | 'mounted' | 'unmounting';
  /** Custom distance gap offset from the trigger in pixels. */
  offset?: number;
  /** Custom exit transition duration override in milliseconds. */
  exitTransitionDuration?: number;
  /** Custom base z-index layering override. */
  baseZIndex?: number;
  /** Custom horizontal/vertical cascade offset step override. */
  cascadeOffsetStep?: number;
  /** Custom cascade stacking offset shift direction override. */
  cascadeOffsetDirection?: 'left' | 'right' | 'top' | 'bottom' | 'none';
  /** Custom spring tilt effect toggle override. */
  enableTilt?: boolean;
  /** Custom max spring tilt angle override. */
  maxTiltAngle?: number;
  /** Custom spring tilt speed sensitivity override. */
  tiltSensitivity?: number;
  /** Custom lock axis constraints for dragging ('x' | 'y' | 'both'). */
  dragAxis?: 'x' | 'y' | 'both';
  /** Custom spring tilt friction coefficient (default: 0.95). */
  tiltFriction?: number;
  /** Custom spring tilt inertia decay coefficient (default: 0.82). */
  tiltDecay?: number;
  /** Custom CSS animation class applied during the mounting status. */
  mountingClassName?: string;
  /** Custom CSS animation class applied during the unmounting status. */
  unmountingClassName?: string;
  /** Custom CSS animation class applied during the mounted status. */
  mountedClassName?: string;
}

/**
 * Resolver callback type for lazy-loading/hydrating data for a popover card.
 *
 * @template TData - The type of data resolved by the callback.
 * @template TContext - The type of external global context passed to the resolver.
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
 */
export interface PopoverStateData<TData = unknown, TContext = unknown> {
  /** The stack of active popovers in the current trail path. */
  trail: TrailEntry<TData>[];

  /** Pinned/floating modeless popovers currently placed in the viewport. */
  floating: TrailEntry<TData>[];

  /** Current owner claiming the active trail path. Used to coordinate multiple providers. */
  ownerId: string | null;

  /** Drag-and-drop coordinate offsets relative to initial position, mapped by popover key. */
  offsets: Record<string, { x: number; y: number }>;

  /** Pinned/floating status mapped by popover key. */
  pinnedStates: Record<string, boolean>;

  /** z-index depth order list of keys (highest/topmost is last). */
  zIndexOrder: string[];

  /** Counter tracking root-level hydration requests to avoid race conditions. */
  rootHydrationRequestCounter: number;

  /** Counters tracking nested hydration requests mapped by parent key. */
  nestedHydrationRequestCounters: Record<string, number>;

  /** The HTML anchor element triggering the root popover. Retained for boundary references. */
  anchorElement: HTMLElement | null;

  /** Bound box rect of the root anchor element. */
  anchorRect: DOMRect | null;

  /** Current external global context values. */
  context: TContext | null;

  /** Whether to recursively close pinned descendants when parent closes. */
  closePinnedDescendants: boolean;

  /** Global collision settings default. */
  collisionConfig: CollisionConfig | null;

  /** Custom data cache provider. */
  cache: PopoverCache<TData> | null;

  /** Active resolver callback. */
  resolveData: PopoverResolver<TData, TContext>;

  /** Whether keyboard arrow navigation is enabled. */
  enableArrowNavigation: boolean;

  /** Whether debug logging is enabled. */
  debug: boolean;

  /** Horizontal offset step applied per level of the cascade trail (default: 8px). */
  cascadeOffsetStep: number;
  /** Duration in milliseconds of the card exit animation before it is removed from DOM (default: 0). */
  exitTransitionDuration: number;
  /** Default distance gap offset from the trigger in pixels (default: 8px). */
  defaultOffset: number;
  /** Base z-index offset applied to all popover layers (default: 1000). */
  baseZIndex: number;
  /** Global default CSS animation class applied during mounting. */
  mountingClassName: string;
  /** Global default CSS animation class applied during unmounting. */
  unmountingClassName: string;
  /** Global default CSS animation class applied during mounted. */
  mountedClassName: string;
}

/**
 * The dispatch and lifecycle actions exposed by the popover store.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 */
export interface PopoverActions<TData = unknown, TContext = unknown> {
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
  togglePin: (key: string, rect?: DOMRect) => void;

  /** Brings a popover and its descendants to the top of the z-index list. */
  bringToFront: (key: string) => void;

  /** Closes all popovers at and after a specific virtual index. */
  closeFrom: (index: number, options?: { transition?: boolean }) => void;

  /** Updates coordinate offsets from drag events. */
  updateOffset: (key: string, x: number, y: number) => void;

  /** Resets state completely, aborting all active requests. */
  clear: () => void;

  /** Clears only the active trail (retains floating ones). */
  clearTrail: () => void;

  /** Closes the topmost active popover based on z-index depth order. */
  closeTopmost: () => void;

  /** Resolves data and opens a root popover. */
  openRootWithResolver: (
    keyOrName: string,
    anchorEvent:
      | { currentTarget: HTMLElement; stopPropagation?: () => void }
      | { getBoundingClientRect: () => DOMRect; stopPropagation?: () => void },
    options?: OpenRootOptions,
  ) => Promise<void>;

  /** Resolves data and opens a nested popover from a source parent popover key. */
  openNestedWithResolver: (
    keyOrName: string,
    sourceKey: string,
    options?: OpenNestedOptions,
  ) => Promise<void>;

  /** Retries resolving data for an active popover that previously failed to load. */
  retryPopover: (key: string) => Promise<void>;

  /** Lifecycle cleanup: aborts all in-flight requests and resets state. */
  destroy: () => void;

  /** Set closePinnedDescendants configuration dynamically. */
  setClosePinnedDescendants: (close: boolean) => void;

  /** Updates the global collision config dynamically. */
  setCollisionConfig: (config: CollisionConfig | null) => void;

  /** Closes exactly the popover matching the specified key along with all its descendants. */
  closeByKey: (key: string, options?: { transition?: boolean }) => void;

  /** Sets whether keyboard arrow navigation is enabled. */
  setEnableArrowNavigation: (enable: boolean) => void;

  /** Sets whether debug logging is enabled. */
  setDebug: (debug: boolean) => void;

  /** Clears the close timer for the given key and its ancestors. */
  hoverEnter: (key: string) => void;

  /** Starts a close timer for the given key. */
  hoverLeave: (key: string, delay?: number) => void;

  /** Sets the horizontal stepping shift per nesting level. */
  setCascadeOffsetStep: (step: number) => void;

  /** Sets the transition lifecycle status of a specific popover card. */
  setTransitionStatus: (
    key: string,
    status: 'mounting' | 'mounted' | 'unmounting',
  ) => void;

  /** Sets the exit transition duration. */
  setExitTransitionDuration: (duration: number) => void;

  /** Sets the default distance gap offset. */
  setDefaultOffset: (offset: number) => void;

  /** Sets the base z-index layering offset. */
  setBaseZIndex: (baseZIndex: number) => void;

  /** Sets the global default CSS animation class names. */
  setGlobalAnimationClassNames: (mounting: string, unmounting: string, mounted: string) => void;
}

/**
 * Complete representation of the Popover Zustand store state and actions.
 */
export type PopoverStore<TData = unknown, TContext = unknown> = PopoverStateData<TData, TContext> &
  PopoverActions<TData, TContext> & {
    actions: Omit<
      PopoverActions<TData, TContext>,
      | 'setContext'
      | 'setResolveData'
      | 'setOwnerId'
      | 'openRoot'
      | 'pushNested'
      | 'destroy'
      | 'setClosePinnedDescendants'
      | 'setCollisionConfig'
      | 'setEnableArrowNavigation'
      | 'setDebug'
      | 'setCascadeOffsetStep'
    >;
  };

/**
 * Valid relative placements supported by Floating UI.
 */
export type PopoverPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'right-start'
  | 'right-end'
  | 'left-start'
  | 'left-end';

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
 */
export interface PopoverCache<TData = unknown> {
  /** Retrieves a cached entry. Can return the value directly or a Promise. */
  get: (key: string) => Promise<TData | undefined> | TData | undefined;

  /** Saves data in the cache. */
  set: (key: string, data: TData) => Promise<void> | void;

  /** Removes a specific item from the cache. */
  delete: (key: string) => Promise<void> | void;

  /** Clears the cache completely. */
  clear: () => Promise<void> | void;
}

/**
 * Boundary collision settings used by Floating UI shift/flip middleware.
 */
export interface CollisionConfig {
  /**
   * DOM element(s) to constrain the popover within (default: 'clippingAncestors').
   * Can be a function returned at runtime (lazy resolution).
   */
  boundary?:
    | 'clippingAncestors'
    | HTMLElement
    | HTMLElement[]
    | (() => HTMLElement | HTMLElement[] | null);

  /** Safety padding margin around the boundary (default: 12 for shift, 0 for flip). */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  /** Toggle or configure the Floating UI flip middleware (default: true). */
  flip?: boolean | object;
  /** Toggle or configure the Floating UI shift middleware (default: true). */
  shift?: boolean | object;
  /** Toggle or configure the Floating UI size middleware (default: false). */
  size?: boolean | object;
}

/**
 * Options configuration for spawning root popovers.
 */
export interface OpenRootOptions {
  /** Optional custom owner identifier claiming the trail. */
  ownerId?: string;

  /** Custom boundary collision overrides. */
  collision?: CollisionConfig;

  /** Hover-trigger options configuration overrides. */
  hover?: HoverConfig;

  /** Accessibility description text linked via aria-describedby. */
  ariaDescribedby?: string;

  /** True to allow dragging even when the popover is unpinned/trailing. */
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
  cascadeOffsetDirection?: 'left' | 'right' | 'top' | 'bottom' | 'none';
  /** Custom spring tilt effect toggle override. */
  enableTilt?: boolean;
  /** Custom max spring tilt angle override. */
  maxTiltAngle?: number;
  /** Custom spring tilt speed sensitivity override. */
  tiltSensitivity?: number;
  /** Custom lock axis constraints for dragging ('x' | 'y' | 'both'). */
  dragAxis?: 'x' | 'y' | 'both';
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
}

/**
 * Options configuration for spawning nested popovers.
 */
export interface OpenNestedOptions {
  /** Bounding box of the nested trigger element. */
  triggerRect?: DOMRect;

  /** Custom boundary collision overrides. */
  collision?: CollisionConfig;

  /** Hover-trigger options configuration overrides. */
  hover?: HoverConfig;

  /** Accessibility description text linked via aria-describedby. */
  ariaDescribedby?: string;

  /** True to allow dragging even when the popover is unpinned/trailing. */
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
  cascadeOffsetDirection?: 'left' | 'right' | 'top' | 'bottom' | 'none';
  /** Custom spring tilt effect toggle override. */
  enableTilt?: boolean;
  /** Custom max spring tilt angle override. */
  maxTiltAngle?: number;
  /** Custom spring tilt speed sensitivity override. */
  tiltSensitivity?: number;
  /** Custom lock axis constraints for dragging ('x' | 'y' | 'both'). */
  dragAxis?: 'x' | 'y' | 'both';
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
}
