/**
 * Central Domain Constants for popover-trail.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module constants
 */

import {
  EMPTY_READONLY_ARRAY,
  EMPTY_READONLY_OBJECT,
  EMPTY_READONLY_SET,
} from './types/branded';
import type { DragOffset } from './types/geometry';

export const defaultPopoverConfig = {
  timing: { hoverOpenDelay: 200, hoverLeaveDelay: 300, exitTransitionDuration: 200 },
  layout: { cascadeStep: 8, defaultOffset: 8, collisionPadding: 12 },
  viewport: { mobileBreakpoint: 768 },
  zIndex: { base: 1000, step: 10 },
} as const;

export const DEFAULT_POPOVER_SELECTOR = '.popover-card';
export const DEFAULT_BASE_Z_INDEX = defaultPopoverConfig.zIndex.base;
export const DEFAULT_CASCADE_STEP = 24;
export const DEFAULT_CASCADE_OFFSET_STEP = defaultPopoverConfig.layout.cascadeStep;
export const DEFAULT_OFFSET_PX = defaultPopoverConfig.layout.defaultOffset;
export const DEFAULT_EXIT_DURATION_MS = defaultPopoverConfig.timing.exitTransitionDuration;
export const DEFAULT_HOVER_CLOSE_DELAY_MS = defaultPopoverConfig.timing.hoverLeaveDelay;
export const DEFAULT_MOBILE_BREAKPOINT_PX = defaultPopoverConfig.viewport.mobileBreakpoint;
export const FRAME_NORMALIZATION_RATIO = 16.667;
export const DEFAULT_DRAG_DISTANCE_THRESHOLD = 8;
export const DEFAULT_TOUCH_DELAY_MS = 200;
export const DEFAULT_TOUCH_TOLERANCE_PX = 5;
export const DEFAULT_MAX_HISTORY_DEPTH = 30;
export const DEFAULT_MAX_TILT_ANGLE = 5;
export const DEFAULT_TILT_SENSITIVITY = 8;
export const DEFAULT_TILT_FRICTION = 0.95;
export const DEFAULT_TILT_DECAY = 0.82;
export const TILT_ZERO_THRESHOLD = 0.05;
export const TRANSITION_STATUS_UNMOUNTING = 'unmounting';

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

export const VALID_PLACEMENTS_SET: ReadonlySet<string> = new Set(POPOVER_BASE_PLACEMENTS);

export const DATA_POPOVER_PORTAL = 'data-popover-portal' as const;
export const DATA_POPOVER_IGNORE_OUTSIDE = 'data-popover-ignore-outside' as const;

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
  EMPTY_READONLY_ARRAY,
  EMPTY_READONLY_OBJECT,
  EMPTY_READONLY_SET,
  emptyRecord,
  emptySet,
} from './types/branded';

export const EMPTY_ARRAY = EMPTY_READONLY_ARRAY;
export const EMPTY_OBJECT = EMPTY_READONLY_OBJECT;
export const EMPTY_SET = EMPTY_READONLY_SET;
export const ZERO_OFFSET: DragOffset = Object.freeze({ x: 0, y: 0 });

