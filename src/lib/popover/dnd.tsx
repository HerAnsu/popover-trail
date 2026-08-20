/**
 * Drag-and-Drop (dnd-kit) Integration Module for popover-trail.
 * Provides `usePopoverDraggableCard`, `PopoverCanvas`, and `PopoverCard` with
 * spring physics tilt, viewport clamping, multi-tab sync, and keyboard focus lock.
 *
 * @module dnd
 */

import { memo, useCallback, useRef, useMemo, type ReactNode } from 'react';
import {
  useDraggable,
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core';
import FocusLock from 'react-focus-lock';
import { usePopoverCard, type UsePopoverCardResult } from './hooks/usePopoverCard';
import { usePopoverDragAndDrop } from './hooks/useDragAndDrop';
import { useMergedRef } from './hooks/useHookUtils';
import {
  DEFAULT_DRAG_DISTANCE_THRESHOLD,
  DEFAULT_TOUCH_DELAY_MS,
  DEFAULT_TOUCH_TOLERANCE_PX,
} from './constants';
import { usePopoverOffset, usePopoverTrail, usePopoverFloating } from './hooks/usePopoverSelectors';
import { usePopoverStore, usePopoverStoreApi, usePopoverActions } from './context/usePopoverStore';
import { PopoverCardContext } from './context/PopoverCardContext';
import { getPopoverStyles } from './utils/styles';
import { clsx } from './utils/clsx';
import { extractNumericStyle } from './utils/typeGuards';
import type { TrailEntry, PopoverPlacement } from './types';

const FIXED_CONTAINER_STYLE = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
} satisfies React.CSSProperties;
const AUTO_POINTER_STYLE = { pointerEvents: 'auto' } satisfies React.CSSProperties;
const DISPLAY_NONE_STYLE = { display: 'none' } satisfies React.CSSProperties;
const FULL_FLEX_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
} satisfies React.CSSProperties;
const RETURN_FOCUS_CONFIG = { preventScroll: true };

function resolveDragTransformState(
  isDragAllowed: boolean,
  offset: { x: number; y: number },
  physics: { rotation: number; rotationX: number; rotationY: number; dragX: number; dragY: number },
) {
  if (!isDragAllowed) {
    return {
      offset: { x: 0, y: 0 },
      dragX: 0,
      dragY: 0,
      rotation: 0,
      rotationX: 0,
      rotationY: 0,
    };
  }
  return {
    offset,
    dragX: physics.dragX,
    dragY: physics.dragY,
    rotation: physics.rotation,
    rotationX: physics.rotationX,
    rotationY: physics.rotationY,
  };
}

/**
 * Options parameters for the `usePopoverDraggableCard` composite hook.
 */
export interface UsePopoverDraggableCardOptions {
  /** The specific trail entry data represented by the card. */
  entry: TrailEntry;
  /** The 0-based virtual rendering index of the card. */
  index: number;
  /** Whether this card is currently pinned as a floating window (`true`) or stacked in the trail (`false`). */
  isPinned: boolean;
  /** Relative alignment placement direction preference (defaults to 'bottom'). */
  placement?: PopoverPlacement;
  /** Whether to enable pointer drag-and-drop movement when pinned (defaults to true). */
  enableDrag?: boolean;
  /** Whether to enable dynamic spring tilt and velocity swing effects when dragging (defaults to true). */
  enableTilt?: boolean;
  /** Maximum tilt swing angle limit in degrees (defaults to 5). */
  maxTiltAngle?: number;
  /** Sensitivity multiplier scaling angular tilt response to cursor drag velocity (defaults to 8). */
  tiltSensitivity?: number;
}

/**
 * Result object returned by the `usePopoverDraggableCard` hook.
 */
export interface UsePopoverDraggableCardResult extends UsePopoverCardResult {
  /** Whether pointer dragging is currently allowed for this specific card. */
  isDragAllowed: boolean;
  /** Callback handler to toggle the pinned status of the card. */
  handlePinToggle: () => void;
}

function isDragOperationPermitted(
  entry: TrailEntry,
  enableDrag: boolean,
  isButtonDragEnabled: boolean,
  isPinned: boolean,
): boolean {
  const allowWhenPinned = entry.allowDragWhenPinned ?? true;
  const allowWhenUnpinned = entry.allowDragWhenUnpinned ?? true;
  return enableDrag && isButtonDragEnabled && (isPinned ? allowWhenPinned : allowWhenUnpinned);
}

function resolveTiltParameters(
  entry: TrailEntry,
  enableTilt: boolean,
  maxTiltAngle: number,
  tiltSensitivity: number,
) {
  return {
    tiltEnabled: entry.enableTilt ?? enableTilt,
    maxTilt: entry.maxTiltAngle ?? maxTiltAngle,
    sensitivity: entry.tiltSensitivity ?? tiltSensitivity,
    axis: entry.dragAxis ?? 'both',
    friction: entry.tiltFriction ?? 0.95,
    decay: entry.tiltDecay ?? 0.82,
  };
}

/**
 * Composite hook binding Floating UI placement, focus management, physical spring rotation tilt,
 * and `@dnd-kit/core` pointer dragging into a single unified popover interface.
 *
 * @remarks
 * Combines geometry positioning from Floating UI with dnd-kit transform offsets and Euler tilt rotation.
 * Automatically synchronizes pixel drag offsets with the Zustand state store on drag end.
 *
 * @example
 * ```tsx
 * function CustomDraggableCard({ entry, index, isPinned }) {
 *   const { ref, style, dragHandleProps, isDragging } = usePopoverDraggableCard({
 *     entry,
 *     index,
 *     isPinned,
 *     enableTilt: true,
 *   });
 *
 *   return (
 *     <div ref={ref} style={style}>
 *       <div {...dragHandleProps} className="drag-handle">Drag here</div>
 *       <div>{entry.data?.title}</div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param options - Configuration options for positioning, dragging, and tilt physics.
 * @returns Combined card positioning, interaction handlers, drag handle bindings, and pin toggle callback.
 */
export function usePopoverDraggableCard({
  entry,
  index,
  isPinned,
  placement = 'bottom',
  enableDrag = true,
  enableTilt = true,
  maxTiltAngle = 5,
  tiltSensitivity = 8,
}: UsePopoverDraggableCardOptions): UsePopoverDraggableCardResult {
  const card = usePopoverCard({ entry, index, isPinned, placement });

  const isDragAllowed = isDragOperationPermitted(
    entry,
    enableDrag,
    card.buttonControls.enableDrag,
    isPinned,
  );

  // 1. Set up dnd-kit dragging
  const { setNodeRef, transform, isDragging, attributes, listeners } = useDraggable({
    id: entry.key,
    disabled: !isDragAllowed,
  });

  const domRef = useRef<HTMLDivElement | null>(null);

  // 2. Physics-based rotation swing setup
  const tilt = resolveTiltParameters(entry, enableTilt, maxTiltAngle, tiltSensitivity);

  const physics = usePopoverDragAndDrop({
    isDragging: isDragAllowed ? isDragging : false,
    transform: isDragAllowed ? transform : null,
    enableTilt: tilt.tiltEnabled,
    maxTiltAngle: tilt.maxTilt,
    tiltSensitivity: tilt.sensitivity,
    dragAxis: tilt.axis,
    tiltFriction: tilt.friction,
    tiltDecay: tilt.decay,
    cardRef: domRef,
  });

  // 3. Compile styles using the compiler utility with active dragging offsets and rotation angles
  const offset = usePopoverOffset(entry.key);
  const dragTransforms = resolveDragTransformState(isDragAllowed, offset, physics);

  const style = getPopoverStyles({
    finalLayoutPos: {
      top: extractNumericStyle(card.style.top),
      left: extractNumericStyle(card.style.left),
    },
    ...dragTransforms,
    zIndex: extractNumericStyle(card.style.zIndex),
  });

  const setCombinedRef = useMergedRef(card.ref, domRef, isDragAllowed ? setNodeRef : undefined);

  const handlePinToggle = useCallback(() => {
    if (domRef.current) {
      const currentRect = domRef.current.getBoundingClientRect();
      card.actions.togglePin(entry.key, currentRect);
    }
  }, [card.actions, entry.key]);

  return {
    ...card,
    ref: setCombinedRef,
    style,
    isDragging: isDragAllowed ? isDragging : false,
    isDragAllowed,
    dragHandleProps: isDragAllowed
      ? {
          ...attributes,
          ...listeners,
          style: { cursor: isDragging ? 'grabbing' : 'grab' },
        }
      : {},
    handlePinToggle,
  };
}

/**
 * Prop types for the `PopoverCanvas` component.
 *
 * @template TData - The resolved data payload type.
 */
export interface PopoverCanvasProps<TData> {
  /** Render prop returning JSX content for a single popover card. */
  children: (props: { entry: TrailEntry<TData>; index: number; isPinned: boolean }) => ReactNode;

  /** Optional custom DndContext modifiers. */
  modifiers?: Modifier[];

  /** Set true to lock dragging coordinates strictly to the window viewport edges. */
  restrictToWindow?: boolean;

  /** Set true to lock dragging coordinates strictly to this canvas container element boundaries. */
  restrictToContainer?: boolean;
}

interface Transform2D {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

interface NodeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface BoundsRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function clampCoordinateToBounds(
  transform: Transform2D,
  activeNodeRect: NodeRect,
  bounds: BoundsRect,
): Transform2D {
  const minX = bounds.left - activeNodeRect.left;
  const maxX = bounds.right - activeNodeRect.left - activeNodeRect.width;
  const minY = bounds.top - activeNodeRect.top;
  const maxY = bounds.bottom - activeNodeRect.top - activeNodeRect.height;

  return {
    ...transform,
    x: Math.max(minX, Math.min(maxX, transform.x)),
    y: Math.max(minY, Math.min(maxY, transform.y)),
    scaleX: transform.scaleX ?? 1,
    scaleY: transform.scaleY ?? 1,
  };
}

function clampToWindowBounds(transform: Transform2D, activeNodeRect: NodeRect): Transform2D {
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  return clampCoordinateToBounds(transform, activeNodeRect, {
    left: 0,
    top: 0,
    right: windowWidth,
    bottom: windowHeight,
  });
}

function clampToContainerBounds(
  transform: Transform2D,
  activeNodeRect: NodeRect,
  containerRect: DOMRect,
): Transform2D {
  return clampCoordinateToBounds(transform, activeNodeRect, {
    left: containerRect.left,
    top: containerRect.top,
    right: containerRect.right,
    bottom: containerRect.bottom,
  });
}

/**
 * High-level drag-and-drop canvas container for rendering interactive popover trails and floating cards.
 *
 * @remarks
 * Embeds a `@dnd-kit/core` `DndContext` configured with Pointer, Touch, and Keyboard sensors.
 * Manages layer stacking order (`bringToFront` on drag start), persist offsets on drag end,
 * and boundary coordinate clamping when `restrictToWindow` or `restrictToContainer` is enabled.
 *
 * @example
 * ```tsx
 * import { PopoverCanvas, PopoverCard } from 'popover-trail/dnd';
 *
 * export function CanvasView() {
 *   return (
 *     <PopoverCanvas restrictToWindow>
 *       {({ entry, index, isPinned }) => (
 *         <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
 *           <div>{entry.data?.title}</div>
 *         </PopoverCard>
 *       )}
 *     </PopoverCanvas>
 *   );
 * }
 * ```
 *
 * @template TData - Resolved data payload type.
 * @param props - Canvas options and card render prop callback.
 */
export function PopoverCanvas<TData = unknown>({
  children,
  modifiers: customModifiers,
  restrictToWindow = false,
  restrictToContainer = false,
}: Readonly<PopoverCanvasProps<TData>>) {
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();
  const store = usePopoverStoreApi<TData>();
  const { updateOffset, bringToFront } = usePopoverActions<TData>();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DEFAULT_DRAG_DISTANCE_THRESHOLD },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: DEFAULT_TOUCH_DELAY_MS,
        tolerance: DEFAULT_TOUCH_TOLERANCE_PX,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const computedModifiers = useMemo(() => {
    const list: Modifier[] = [];

    if (restrictToWindow) {
      list.push(({ transform, activeNodeRect }) => {
        if (!activeNodeRect) return transform;
        return clampToWindowBounds(transform, activeNodeRect);
      });
    }

    if (restrictToContainer) {
      list.push(({ transform, activeNodeRect }) => {
        if (!activeNodeRect || !containerRef.current) return transform;
        const containerRect = containerRef.current.getBoundingClientRect();
        return clampToContainerBounds(transform, activeNodeRect, containerRect);
      });
    }

    if (customModifiers) {
      list.push(...customModifiers);
    }

    return list;
  }, [restrictToWindow, restrictToContainer, customModifiers]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const key = String(event.active.id);
      bringToFront(key);
    },
    [bringToFront],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const key = String(active.id);
      const currentOffset = store.getState().offsets[key] ?? { x: 0, y: 0 };
      const safeDeltaX = Number.isFinite(delta?.x) ? delta.x : 0;
      const safeDeltaY = Number.isFinite(delta?.y) ? delta.y : 0;
      updateOffset(key, currentOffset.x + safeDeltaX, currentOffset.y + safeDeltaY);
    },
    [store, updateOffset],
  );

  const zIndexOrder = usePopoverStore((state) => state.zIndexOrder);

  const activeEntries = useMemo(() => {
    const raw = [
      ...floating.map((entry, idx) => ({ entry, isPinned: true, index: idx })),
      ...trail.map((entry, idx) => ({ entry, isPinned: false, index: floating.length + idx })),
    ];
    if (zIndexOrder.length === 0) return raw;
    const orderMap = new Map<string, number>(zIndexOrder.filter(Boolean).map((key, i) => [key, i]));
    return raw.sort((a, b) => {
      const idxA = orderMap.get(a.entry.key);
      const idxB = orderMap.get(b.entry.key);
      if (idxA !== undefined && idxB !== undefined) return idxA - idxB;
      if (idxA !== undefined) return 1;
      if (idxB !== undefined) return -1;
      return a.index - b.index;
    });
  }, [floating, trail, zIndexOrder]);

  if (activeEntries.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragEnd}
      modifiers={computedModifiers}>
      <div ref={containerRef} style={FIXED_CONTAINER_STYLE}>
        {activeEntries.map(({ entry, isPinned, index: entryIndex }) => (
          <div key={entry.key} style={AUTO_POINTER_STYLE}>
            {children({
              entry,
              index: entryIndex,
              isPinned,
            })}
          </div>
        ))}
      </div>
    </DndContext>
  );
}

/**
 * Event and attribute props passed to custom drag handle render callbacks.
 */
export interface PopoverDragHandleProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.Ref<HTMLElement>;
  style?: React.CSSProperties;
}

/**
 * Feature toggle flags for the high-level `<PopoverCard>` component.
 */
export interface PopoverCardFeatures {
  /** True to allow dragging (default: true). */
  drag?: boolean;
  /** True to enable spring rotation physics (default: true). */
  tilt?: boolean;
  /** Set true to enable React Focus Lock when this card is topmost (default: true). */
  focusLock?: boolean;
}

/**
 * Prop types for the high-level `PopoverCard` component.
 */
export interface PopoverCardProps<TData> {
  /** The specific trail entry data. */
  entry: TrailEntry<TData>;
  /** The rendering index of the card. */
  index: number;
  /** True if this card is currently pinned/floating. */
  isPinned: boolean;
  /** Layout placement direction preference. */
  placement?: PopoverPlacement;
  /** JSX elements to render inside the card container. */
  children: ReactNode;
  /** CSS class name applied to the outer card wrapper. */
  className?: string;
  /** Inline styles applied to the outer card wrapper. */
  style?: React.CSSProperties;
  /** Feature configuration flags for dragging, physics tilt, and focus trapping. */
  features?: PopoverCardFeatures;
  /** @deprecated Use `features.drag` instead. */
  enableDrag?: boolean;
  /** @deprecated Use `features.tilt` instead. */
  enableTilt?: boolean;
  /** @deprecated Use `features.focusLock` instead. */
  enableFocusLock?: boolean;
  /** Custom drag handle trigger element. If not specified, the entire card is draggable. */
  dragHandle?: (props: PopoverDragHandleProps) => ReactNode;
}

function resolveFeatureFlag(featureVal?: boolean, propVal?: boolean): boolean {
  if (featureVal !== undefined) return featureVal;
  if (propVal !== undefined) return propVal;
  return true;
}

function resolveCardFeatures<TData>(props: PopoverCardProps<TData>) {
  const feat = props.features;
  return {
    dragEnabled: resolveFeatureFlag(feat?.drag, props.enableDrag),
    tiltEnabled: resolveFeatureFlag(feat?.tilt, props.enableTilt),
    focusLockEnabled: resolveFeatureFlag(feat?.focusLock, props.enableFocusLock),
  };
}

/**
 * High-level pre-bound PopoverCard component that handles hooks, refs, styles,
 * dragging physics, focus locks, and event bindings automatically.
 *
 * @template TData - The resolved data payload type.
 */
function PopoverCardInner<TData = unknown>(props: Readonly<PopoverCardProps<TData>>) {
  const {
    entry,
    index,
    isPinned,
    placement = 'bottom',
    children,
    className = 'popover-card',
    style: customStyle,
    dragHandle,
  } = props;

  const { dragEnabled, tiltEnabled, focusLockEnabled } = resolveCardFeatures(props);

  const {
    ref,
    style,
    isTop,
    isDragging,
    isDragAllowed,
    actions,
    dragHandleProps,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    transitionClassName,
  } = usePopoverDraggableCard({
    entry,
    index,
    isPinned,
    placement,
    enableDrag: dragEnabled,
    enableTilt: tiltEnabled,
  });

  const handleMouseDown = useCallback(() => {
    actions.bringToFront(entry.key);
  }, [actions, entry.key]);

  const combinedClassName = useMemo(
    () =>
      clsx(
        className,
        {
          topmost: isTop,
          pinned: isPinned,
          dragging: isDragging,
        },
        transitionClassName,
      ),
    [className, isTop, isPinned, isDragging, transitionClassName],
  );

  const combinedStyle = useMemo(
    () => ({
      ...style,
      ...(entry.exitTransitionDuration !== undefined
        ? { transitionDuration: `${entry.exitTransitionDuration}ms` }
        : {}),
      ...customStyle,
    }),
    [style, entry.exitTransitionDuration, customStyle],
  );

  const resolvedDragHandleProps = isDragAllowed ? dragHandleProps : {};

  return (
    <dialog
      open
      tabIndex={-1}
      id={`popover-card-${entry.key}`}
      ref={ref}
      style={combinedStyle}
      aria-labelledby={`title-${entry.key}`}
      aria-describedby={entry.ariaDescribedby ? `desc-${entry.key}` : undefined}
      className={combinedClassName}>
      <FocusLock
        disabled={!focusLockEnabled || !isTop || isPinned}
        returnFocus={RETURN_FOCUS_CONFIG}>
        <div
          role="presentation"
          style={FULL_FLEX_CONTAINER_STYLE}
          onMouseDown={handleMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onKeyDown={onKeyDown}>
          <PopoverCardContext value={entry.key}>
            {entry.ariaDescribedby && (
              <div id={`desc-${entry.key}`} style={DISPLAY_NONE_STYLE}>
                {entry.ariaDescribedby}
              </div>
            )}

            {dragHandle ? (
              <>
                {dragHandle(resolvedDragHandleProps)}
                {children}
              </>
            ) : (
              <div {...resolvedDragHandleProps} style={FULL_FLEX_CONTAINER_STYLE}>
                {children}
              </div>
            )}
          </PopoverCardContext>
        </div>
      </FocusLock>
    </dialog>
  );
}

export const PopoverCard = memo(PopoverCardInner);
PopoverCard.displayName = 'PopoverCard';
