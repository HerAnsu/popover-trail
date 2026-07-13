export interface TrailEntry<TData = any> {
  /** Unique identifier for this popover instance. */
  key: string;
  /** Parent popover identifier (tracks tree hierarchy in nested paths). */
  parentKey?: string;
  /** Bounding box of the element that triggered/anchored this popover. */
  rect?: DOMRect;
  /** Custom coordinates if the popover is pinned/floating. */
  pinnedLayoutPos?: {
    top: number;
    left: number;
  };
  /** Resolved data payload. */
  data?: TData;
  /** Loading flag during asynchronous resolution. */
  isLoading?: boolean;
  /** Error information if resolution fails. */
  error?: Error | null;
  /** Original parent key stored to restore hierarchy after unpinning. */
  originalParentKey?: string;
  /** Original anchor bounding box stored to restore geometry after unpinning. */
  originalRect?: DOMRect;
}

/**
 * Resolver callback type for lazy-loading/hydrating popover data.
 */
export type PopoverResolver<TData = any, TContext = any> = (
  keyOrName: string,
  parentData?: TData,
  context?: TContext,
  signal?: AbortSignal,
) => Promise<TData> | TData;

export interface PopoverStateData<TData = any, TContext = any> {
  /** The stack of active popovers in the current trail path. */
  trail: TrailEntry<TData>[];
  /** Pinned/floating popovers in the viewport. */
  floating: TrailEntry<TData>[];
  /** Current owner claiming the active trail path. */
  ownerId: string | null;
  /** Drag-and-drop coordinate offsets mapped by popover key. */
  offsets: Record<string, { x: number; y: number }>;
  /** Pinned/floating status mapped by popover key. */
  pinnedStates: Record<string, boolean>;
  /** z-index depth order list of keys (highest is last). */
  zIndexOrder: string[];
  /** Counter tracking root-level hydration requests to avoid race conditions. */
  rootHydrationRequestCounter: number;
  /** Counters tracking nested hydration requests mapped by parent key. */
  nestedHydrationRequestCounters: Record<string, number>;
  /** The HTML anchor element triggering the root popover. */
  anchorElement: HTMLElement | null;
  /** Bound box rect of the root anchor element. */
  anchorRect: DOMRect | null;
  /** Current external global context values. */
  context: TContext | null;
  /** Whether to recursively close pinned descendants when parent closes. */
  closePinnedDescendants: boolean;
}

export interface PopoverActions<TData = any, TContext = any> {
  /** Updates the shared global context field. */
  setContext: (context: TContext) => void;
  /** Updates the owner ID claiming the trail. */
  setOwnerId: (ownerId: string | null) => void;
  /** Spawns a new popover trail root. */
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;
  /** Appends a nested popover after a parent index. */
  pushNested: (index: number, entry: TrailEntry<TData>) => void;
  /** Toggles a popover's pinned status. */
  togglePin: (key: string, rect?: DOMRect) => void;
  /** Brings a popover and its descendants to the top of the z-index list. */
  bringToFront: (key: string) => void;
  /** Closes all popovers at and after a specific index. */
  closeFrom: (index: number) => void;
  /** Updates coordinate offsets from drag events. */
  updateOffset: (key: string, x: number, y: number) => void;
  /** Resets state completely. */
  clear: () => void;
  /** Clears only the active trail (retains floating ones). */
  clearTrail: () => void;
  /** Closes the topmost active popover based on z-index depth order. */
  closeTopmost: () => void;

  // Orchestrator Actions (with resolver support)
  /** Resolves data and opens a root popover. */
  openRootWithResolver: (
    keyOrName: string,
    anchorEvent: { currentTarget: HTMLElement; stopPropagation: () => void },
    ownerIdOverride?: string,
  ) => Promise<void>;
  /** Resolves data and opens a nested popover from a source parent popover key. */
  openNestedWithResolver: (
    keyOrName: string,
    sourceKey: string,
    triggerRect?: DOMRect,
  ) => Promise<void>;
  /** Retries resolving data for an active popover that previously failed to load. */
  retryPopover: (key: string) => Promise<void>;
  /** Lifecycle cleanup: aborts all in-flight requests and resets state. */
  destroy: () => void;
  /** Set closePinnedDescendants configuration dynamically. */
  setClosePinnedDescendants: (close: boolean) => void;
}

export type PopoverStore<TData = any, TContext = any> = PopoverStateData<TData, TContext> &
  PopoverActions<TData, TContext> & {
    actions: Omit<
      PopoverActions<TData, TContext>,
      "setContext" | "setOwnerId" | "openRoot" | "pushNested" | "destroy" | "setClosePinnedDescendants"
    >;
  };

export type PopoverPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end";

export interface ClickOutsideConfig {
  enabled?: boolean;
  ignoreClass?: string;
  /** CSS selector used to identify popover card elements (default: '.popover-card'). */
  popoverSelector?: string;
}
