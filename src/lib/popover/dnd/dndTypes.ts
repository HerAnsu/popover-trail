/**
 * Type Contracts and Configuration Interfaces for Drag-and-Drop Subsystem.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/dndTypes
 */

import type { ReactNode, Ref, CSSProperties, HTMLAttributes } from 'react';
import type { Modifier } from '@dnd-kit/core';
import type { TrailEntry, PopoverPlacement } from '../types';
import type { UsePopoverCardResult } from '../hooks/usePopoverCard';

export interface UsePopoverDraggableCardOptions {
  entry: TrailEntry;
  index: number;
  isPinned: boolean;
  placement?: PopoverPlacement;
  enableDrag?: boolean;
  enableTilt?: boolean;
  maxTiltAngle?: number;
  tiltSensitivity?: number;
}

export interface UsePopoverDraggableCardResult extends UsePopoverCardResult {
  isDragAllowed: boolean;
  handlePinToggle: () => void;
}

export interface PopoverCanvasProps<TData> {
  children: (props: { entry: TrailEntry<TData>; index: number; isPinned: boolean }) => ReactNode;
  modifiers?: Modifier[];
  restrictToWindow?: boolean;
  restrictToContainer?: boolean;
  enableSnapping?: boolean;
  snapThreshold?: number;
}

export interface PopoverDragHandleProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  style?: CSSProperties;
}

export interface PopoverCardFeatures {
  drag?: boolean;
  tilt?: boolean;
  focusLock?: boolean;
}

export interface PopoverCardProps<TData> {
  entry: TrailEntry<TData>;
  index: number;
  isPinned: boolean;
  placement?: PopoverPlacement;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  features?: PopoverCardFeatures;
  enableDrag?: boolean;
  enableTilt?: boolean;
  enableFocusLock?: boolean;
  dragHandle?: (props: PopoverDragHandleProps) => ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export interface Transform2D {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

export interface NodeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface BoundsRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
