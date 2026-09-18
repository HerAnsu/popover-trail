/**
 * Central Domain Constants for popover-trail.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module constants
 */

import type { DragOffset } from './types/geometry';

/**
 * Default global configuration parameters for popover timing, layout, viewport, and z-index.
 */
export const defaultPopoverConfig = {
  timing: { hoverOpenDelay: 200, hoverLeaveDelay: 300, exitTransitionDuration: 200 },
  layout: { cascadeStep: 8, defaultOffset: 8, collisionPadding: 12 },
  viewport: { mobileBreakpoint: 768 },
  zIndex: { base: 1000, step: 10 },
} as const;

/** Default CSS selector targeting rendered popover card DOM nodes. */
export const DEFAULT_POPOVER_SELECTOR = '.popover-card';
/** Default base z-index stacking context for the root popover. */
export const DEFAULT_BASE_Z_INDEX = defaultPopoverConfig.zIndex.base;
/** Default cascade step offset in pixels between sibling levels. */
export const DEFAULT_CASCADE_STEP = 24;
/** Default cascade offset step between nested child popovers. */
export const DEFAULT_CASCADE_OFFSET_STEP = defaultPopoverConfig.layout.cascadeStep;
/** Default gap distance in pixels between anchor trigger and popover. */
export const DEFAULT_OFFSET_PX = defaultPopoverConfig.layout.defaultOffset;
/** Default duration in ms for card exit unmounting animations. */
export const DEFAULT_EXIT_DURATION_MS = defaultPopoverConfig.timing.exitTransitionDuration;
/** Default delay in ms before closing a popover after pointer leave. */
export const DEFAULT_HOVER_CLOSE_DELAY_MS = defaultPopoverConfig.timing.hoverLeaveDelay;
/** Viewport width in pixels below which cards stack in mobile bottom-sheet mode. */
export const DEFAULT_MOBILE_BREAKPOINT_PX = defaultPopoverConfig.viewport.mobileBreakpoint;
/** Frame normalization ratio based on a 60fps frame duration (16.667ms). */
export const FRAME_NORMALIZATION_RATIO = 16.667;
/** Pointer displacement in pixels required before activating drag mode. */
export const DEFAULT_DRAG_DISTANCE_THRESHOLD = 8;
/** Touch hold duration in ms before initiating card drag. */
export const DEFAULT_TOUCH_DELAY_MS = 200;
/** Touch movement tolerance in pixels allowed during hold delay. */
export const DEFAULT_TOUCH_TOLERANCE_PX = 5;
/** Default max capacity of the undo/redo history stack journal. */
export const DEFAULT_MAX_HISTORY_DEPTH = 30;
/** Maximum 3D card tilt angle in degrees during drag interaction. */
export const DEFAULT_MAX_TILT_ANGLE = 5;
/** Velocity sensitivity coefficient for 3D tilt calculation. */
export const DEFAULT_TILT_SENSITIVITY = 8;
/** Friction damping applied to card tilt physics. */
export const DEFAULT_TILT_FRICTION = 0.95;
/** Decay multiplier for spring restoring tilt back to horizontal. */
export const DEFAULT_TILT_DECAY = 0.82;
/** Angle threshold in degrees below which tilt snaps to exactly 0. */
export const TILT_ZERO_THRESHOLD = 0.05;
/** State string identifying an unmounting transition. */
export const TRANSITION_STATUS_UNMOUNTING = 'unmounting';

/**
 * Standard supported popover anchor placement strings.
 */
export const POPOVER_BASE_PLACEMENTS = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
  'auto',
] as const;

/** Readonly set of supported placement strings for $O(1)$ membership checks. */
export const VALID_PLACEMENTS_SET: ReadonlySet<string> = new Set(POPOVER_BASE_PLACEMENTS);

/** DOM data attribute marking portal root containers. */
export const DATA_POPOVER_PORTAL = 'data-popover-portal' as const;
/** DOM data attribute instructing outside click handlers to ignore click dismissal. */
export const DATA_POPOVER_IGNORE_OUTSIDE = 'data-popover-ignore-outside' as const;

/** Query selector matching focusable HTML elements for focus traps. */
export const FOCUSABLE_ELEMENTS_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  "[tabindex]:not([tabindex='-1'])",
].join(',');

export {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  EMPTY_SET,
  emptyRecord,
  emptySet,
} from './types/branded';

/** Immutable frozen zero offset vector `(0, 0)`. */
export const ZERO_OFFSET: DragOffset = Object.freeze({ x: 0, y: 0 });

