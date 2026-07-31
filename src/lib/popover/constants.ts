/**
 * Central Domain Constants for popover-trail.
 * Single source of truth for default configurations, DOM selectors, and physics defaults.
 *
 * @module constants
 */

/** Default CSS class selector for popover cards used by click-outside detection */
export const DEFAULT_POPOVER_SELECTOR = '.popover-card';

/** Default base z-index depth for root popover cards */
export const DEFAULT_BASE_Z_INDEX = 1000;

/** Default pixel step offset for cascading nested popover cards */
export const DEFAULT_CASCADE_STEP = 24;

/** Default exit transition duration in milliseconds */
export const DEFAULT_EXIT_DURATION_MS = 200;

/** 60Hz frame normalization ratio constant (1000ms / 60fps = 16.667ms) */
export const FRAME_NORMALIZATION_RATIO = 16.667;

/** Default PointerSensor drag activation constraint distance in pixels */
export const DEFAULT_DRAG_DISTANCE_THRESHOLD = 8;

/** Default TouchSensor drag activation constraint delay in milliseconds */
export const DEFAULT_TOUCH_DELAY_MS = 200;

/** Default TouchSensor drag activation constraint tolerance in pixels */
export const DEFAULT_TOUCH_TOLERANCE_PX = 5;

/** Default maximum history stack depth for undo/redo */
export const DEFAULT_MAX_HISTORY_DEPTH = 30;
