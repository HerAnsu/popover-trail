import type { Placement, Boundary } from '@floating-ui/react';
import type { StackGroupId, PopoverKey } from './branded';
import type { TrailEntry } from './entryTypes';

/** Branded popover key identifier type. */
export type PopoverKeyId = PopoverKey;

/**
 * Recursively enforces `readonly` on all properties, arrays, Sets, and Maps of type `T`.
 * Ensures store state cannot be mutated in place.
 *
 * @template T - Type to make deeply immutable.
 *
 * @example
 * ```typescript
 * type ImmutableState = DeepReadonly<PopoverStateData>;
 * ```
 */
export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends ReadonlyMap<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends ReadonlySet<infer U>
      ? ReadonlySet<DeepReadonly<U>>
      : T extends readonly (infer U)[]
        ? readonly DeepReadonly<U>[]
        : T extends object
          ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
          : T;

/** Shift direction applied when nesting cascading popover cards. */
export type CascadeOffsetDirection = 'left' | 'right' | 'top' | 'bottom' | 'none';

/** Axis constraint for dragging pinned or trailing popovers. */
export type DragAxis = 'x' | 'y' | 'both';

/** Responsive display adaptation mode on smaller screens. */
export type PopoverResponsiveMode = 'auto' | 'popover' | 'bottom-sheet' | 'modal';

/** Positioning engine and anchoring strategy. */
export type PopoverLayoutStrategy =
  | 'floating-ui'
  | 'fixed-center'
  | 'docked-bottom'
  | 'docked-top'
  | 'custom';

/** Standard keyboard shortcut keys with IDE autocompletion fallback. */
export type KnownKeyboardKey =
  | 'Escape'
  | 'Enter'
  | 'Tab'
  | 'Space'
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'
  | (string & {});

/** Map associating keyboard keys with action callbacks. */
export type KeyboardShortcutMap = Partial<Record<KnownKeyboardKey, (key: string) => void>>;

/** Map of base z-index layering depth offsets per stack group ID. */
export type ZIndexBaseMap = Record<StackGroupId | string, number>;

/**
 * Configuration options for detecting and handling clicks outside active popovers.
 */
export interface ClickOutsideConfig {
  /** If false, disables click-outside detection. */
  enabled?: boolean;
  /** CSS selector for elements that should not trigger a close when clicked. */
  ignoreSelector?: string;
  /** CSS class name for elements that should not trigger a close when clicked. */
  ignoreClass?: string;
  /** CSS selector to identify popover container elements. */
  popoverSelector?: string;
  /** Callback fired when an outside click occurs. */
  onClickOutside?: (event: MouseEvent | TouchEvent) => void;
}

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
 * Configuration options for WAI-ARIA Focus Lock (Focus Trapping) and accessibility controls.
 */
export interface FocusLockOptions {
  /** If true, traps keyboard focus inside the active popover card. */
  enabled?: boolean;
  /** Custom CSS selector or function returning the element to focus on open. */
  autoFocusElement?: string | (() => HTMLElement | null);
  /** If true, restores focus to the trigger element when closed (default: true). */
  returnFocus?: boolean;
  /** If true, prevents page scrolling while the popover is active. */
  lockScroll?: boolean;
}

/**
 * Boundary collision avoidance settings for popover positioning.
 */
export interface CollisionConfig {
  /** Enables boundary collision detection. */
  enabled: boolean;
  /** Custom boundary element or rect for collision boundaries. */
  boundary?: Boundary | (() => Element | null);
  /** Distance in pixels from boundary edges before flipping or shifting. */
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  /** Enable or disable automatic flipping on collision. */
  flip?: boolean;
  /** Enable or disable automatic shifting along axis on collision. */
  shift?: boolean;
  /** Enable or disable dynamic size constraint adjustments on collision. */
  size?: boolean;
}

/**
 * Supported layout placement directions for popover positioning.
 */
export type PopoverPlacement = Placement | 'auto';

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
  /** Force data resolution bypass of current cache or active resolved state. */
  forceRefresh?: boolean;
}

/**
 * Options passed to `openRootWithResolver` when spawning a new root popover.
 */
export interface OpenRootOptions extends PopoverDisplayOptions {
  /** Owner ID claiming the trail stack. */
  ownerId?: string;
  /** Explicit trigger element rect override for relative positioning. */
  triggerRect?: DOMRect;
}

/**
 * Options passed to `openNestedWithResolver` when pushing a child popover.
 */
export interface OpenNestedOptions extends PopoverDisplayOptions {
  /** Explicit trigger element rect override for relative positioning. */
  triggerRect?: DOMRect;
}

/**
 * Custom asynchronous or synchronous key-value storage engine interface.
 */
export interface StateStorageEngine {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  clear?: () => Promise<void> | void;
}

/**
 * Configuration options for persisting active popover states.
 */
export interface PopoverPersistConfig {
  /** Storage key name under localStorage (default: 'popover-trail-state'). */
  key?: string;
  storageKey?: string;
  /** Storage implementation provider (defaults to window.localStorage). */
  storage?: Storage | StateStorageEngine;
  /** If true, automatically rehydrates persisted state on initialization (default: true). */
  autoRehydrate?: boolean;
  /** Custom filter predicate for persisting entries. */
  filter?: (keyOrEntry: unknown, key?: string) => boolean;
}

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
 * Global configuration options passed to PopoverProvider.
 */
export interface PopoverConfig<TData = unknown, TContext = unknown> extends PopoverDisplayOptions {
  /** Default data resolver callback. */
  resolveData?: (
    keyOrName: string,
    parentData?: TData,
    context?: TContext,
    signal?: AbortSignal,
  ) => Promise<TData> | TData;
  /** Initial external context value. */
  initialContext?: TContext;
  /** If true, automatically closes pinned child popovers when their parent closes. */
  closePinnedDescendants?: boolean;
  /** Default collision detection configuration. */
  collisionConfig?: CollisionConfig;
  /** Custom cache provider for caching resolved popover data. */
  cache?: unknown;
  /** Mobile layout breakpoint in pixels (default: 768). */
  mobileBreakpoint?: number;
  /** Global component slot overrides. */
  components?: PopoverSlotComponents;
  /** Base z-index depth offsets per stack group ID. */
  zIndexBaseMap?: ZIndexBaseMap;
  /** State persistence settings configuration options. */
  persistConfig?: PopoverPersistConfig;
}

/** Extended React.CSSProperties supporting popover-trail CSS Custom Properties and custom variables. */
export interface PopoverCSSProperties extends React.CSSProperties {
  '--popover-z-index'?: number | string;
  '--popover-offset-x'?: number | string;
  '--popover-offset-y'?: number | string;
  '--popover-transition-duration'?: string;
  '--popover-max-height'?: string;
  '--popover-max-width'?: string;

  [key: `--${string}`]: string | number | undefined;
}

export { type PopoverThemeTokens } from '../utils/themeTokens';
