/**
 * Popover Display and Open Options Configurations for popover-trail.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/config/optionsConfig
 */

import type { PopoverRect } from '../geometry';
import type { TrailEntry } from '../entryTypes';
import type {
  CascadeOffsetDirection,
  DragAxis,
  PopoverLayoutStrategy,
  PopoverPlacement,
  PopoverResponsiveMode,
} from './displayConfig';
import type { CollisionConfig, FocusLockOptions } from './collisionConfig';
import type { ButtonControlConfig, HoverConfig, KeyboardShortcutMap } from './timingConfig';

export interface PopoverDisplayOptions {
  collision?: CollisionConfig;
  hover?: HoverConfig;
  ariaDescribedby?: string;
  allowDragWhenPinned?: boolean;
  allowDragWhenUnpinned?: boolean;
  placement?: PopoverPlacement;
  offset?: number;
  exitTransitionDuration?: number;
  baseZIndex?: number;
  cascadeOffsetStep?: number;
  cascadeOffsetDirection?: CascadeOffsetDirection;
  enableTilt?: boolean;
  maxTiltAngle?: number;
  tiltSensitivity?: number;
  dragAxis?: DragAxis;
  tiltFriction?: number;
  tiltDecay?: number;
  mountingClassName?: string;
  unmountingClassName?: string;
  mountedClassName?: string;
  buttonControls?: ButtonControlConfig;
  stackGroup?: string;
  responsiveMode?: PopoverResponsiveMode;
  layoutStrategy?: PopoverLayoutStrategy;
  keyboardShortcuts?: KeyboardShortcutMap;
  focusLockOptions?: FocusLockOptions;
  onOpen?: (entry: TrailEntry) => void;
  onClose?: (key: string) => void;
  onPin?: (key: string, isPinned: boolean) => void;
  onError?: (error: Error, key: string) => void;
  forceRefresh?: boolean;
}

export interface OpenRootOptions extends PopoverDisplayOptions {
  ownerId?: string;
  triggerRect?: DOMRect | PopoverRect;
}

export interface OpenNestedOptions extends PopoverDisplayOptions {
  triggerRect?: DOMRect | PopoverRect;
}
