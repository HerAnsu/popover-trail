/* eslint-disable react/only-export-components */
import { useCallback, useRef, useMemo, type ReactNode } from 'react';
import { useDraggable, DndContext, type DragStartEvent, type DragEndEvent, type Modifier } from '@dnd-kit/core';
import FocusLock from 'react-focus-lock';
import { usePopoverCard } from './hooks/usePopoverCard';
import { usePopoverDragAndDrop } from './hooks/useDragAndDrop';
import {
  usePopoverOffset,
  usePopoverTrail,
  usePopoverFloating,
  usePopoverStoreApi,
  usePopoverActions,
} from './context';
import { getPopoverStyles } from './utils/styles';
import type { TrailEntry, PopoverPlacement } from './types';

/**
 * Options parameters for the `usePopoverDraggableCard` composite hook.
 */
export interface UsePopoverDraggableCardOptions {
  /** The specific trail entry data represented by the card. */
  entry: TrailEntry;
  /** The virtual rendering index of the card. */
  index: number;
  /** True if this card is currently pinned/floating. */
  isPinned: boolean;
  /** Relative alignment placement direction preference (default: "bottom"). */
  placement?: PopoverPlacement;
  /** True to allow drag-and-drop movement when pinned (default: true). */
  enableDrag?: boolean;
  /** True to enable physical spring rotation (tilt/swing) effects when dragging (default: true). */
  enableTilt?: boolean;
  /** Maximum tilt swing angle in degrees (default: 5). */
  maxTiltAngle?: number;
  /** Factor scaling tilt response to drag velocity (default: 8). */
  tiltSensitivity?: number;
}

/**
 * An extended version of `usePopoverCard` that integrates `@dnd-kit/core` dragging features,
 * pointer listeners, and physical tilt physics.
 *
 * @param options - Hook configuration settings.
 * @returns Combined card positioning, interaction properties, and drag-and-drop handle bindings.
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
}: UsePopoverDraggableCardOptions) {
  const card = usePopoverCard({ entry, index, isPinned, placement });

  const allowDragWhenUnpinned = entry.allowDragWhenUnpinned ?? false;
  const isDragAllowed = enableDrag && (isPinned || allowDragWhenUnpinned);

  // 1. Set up dnd-kit dragging
  const { setNodeRef, transform, isDragging, attributes, listeners } = useDraggable({
    id: entry.key,
    disabled: !isDragAllowed,
  });

  // 2. Physics-based rotation swing setup
  const tiltEnabled = entry.enableTilt ?? enableTilt;
  const maxTilt = entry.maxTiltAngle ?? maxTiltAngle;
  const sensitivity = entry.tiltSensitivity ?? tiltSensitivity;
  const axis = entry.dragAxis ?? 'both';
  const friction = entry.tiltFriction ?? 0.95;
  const decay = entry.tiltDecay ?? 0.82;

  const { rotation, rotationX, rotationY, dragX, dragY } = usePopoverDragAndDrop({
    isDragging: isDragAllowed ? isDragging : false,
    transform: isDragAllowed ? transform : null,
    enableTilt: tiltEnabled,
    maxTiltAngle: maxTilt,
    tiltSensitivity: sensitivity,
    dragAxis: axis,
    tiltFriction: friction,
    tiltDecay: decay,
  });

  // 3. Compile styles using the compiler utility with active dragging offsets and rotation angles
  const offset = usePopoverOffset(entry.key);
  const style = getPopoverStyles({
    finalLayoutPos: {
      top: (card.style.top as number) || 0,
      left: (card.style.left as number) || 0,
    },
    offset: isDragAllowed ? offset : { x: 0, y: 0 },
    dragX: isDragAllowed ? dragX : 0,
    dragY: isDragAllowed ? dragY : 0,
    rotation: isDragAllowed ? rotation : 0,
    rotationX: isDragAllowed ? rotationX : 0,
    rotationY: isDragAllowed ? rotationY : 0,
    zIndex: card.style.zIndex as number,
  });

  const domRef = useRef<HTMLDivElement | null>(null);

  const setCombinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      card.ref(node);
      domRef.current = node;
      if (isDragAllowed) {
        setNodeRef(node);
      }
    },
    [card, setNodeRef, isDragAllowed],
  );

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
  children: (props: {
    entry: TrailEntry<TData>;
    index: number;
    isPinned: boolean;
  }) => ReactNode;

  /** Optional custom DndContext modifiers. */
  modifiers?: Modifier[];

  /** Set true to lock dragging coordinates strictly to the window viewport edges. */
  restrictToWindow?: boolean;

  /** Set true to lock dragging coordinates strictly to this canvas container element boundaries. */
  restrictToContainer?: boolean;
}

/**
 * Reusable Canvas container that manages drag-and-drop context, coordinate offsets,
 * and z-index ordering for all active floating and trailing popover cards.
 *
 * @template TData - The resolved data payload type.
 * @param props - Component props containing the render prop children.
 * @returns The DndContext wrapper structure.
 */
export function PopoverCanvas<TData = unknown>({
  children,
  modifiers: customModifiers,
  restrictToWindow = false,
  restrictToContainer = false,
}: PopoverCanvasProps<TData>) {
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();
  const store = usePopoverStoreApi<TData>();
  const { updateOffset, bringToFront } = usePopoverActions<TData>();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const computedModifiers = useMemo(() => {
    const list: Modifier[] = [];

    if (restrictToWindow) {
      list.push(({ transform, activeNodeRect }) => {
        if (!activeNodeRect) return transform;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const minX = -activeNodeRect.left;
        const maxX = windowWidth - activeNodeRect.left - activeNodeRect.width;
        const minY = -activeNodeRect.top;
        const maxY = windowHeight - activeNodeRect.top - activeNodeRect.height;

        return {
          ...transform,
          x: Math.max(minX, Math.min(maxX, transform.x)),
          y: Math.max(minY, Math.min(maxY, transform.y)),
        };
      });
    }

    if (restrictToContainer) {
      list.push(({ transform, activeNodeRect }) => {
        if (!activeNodeRect || !containerRef.current) return transform;

        const containerRect = containerRef.current.getBoundingClientRect();

        const minX = containerRect.left - activeNodeRect.left;
        const maxX = containerRect.right - activeNodeRect.left - activeNodeRect.width;
        const minY = containerRect.top - activeNodeRect.top;
        const maxY = containerRect.bottom - activeNodeRect.top - activeNodeRect.height;

        return {
          ...transform,
          x: Math.max(minX, Math.min(maxX, transform.x)),
          y: Math.max(minY, Math.min(maxY, transform.y)),
        };
      });
    }

    if (customModifiers) {
      list.push(...customModifiers);
    }

    return list;
  }, [restrictToWindow, restrictToContainer, customModifiers]);

  const handleDragStart = (event: DragStartEvent) => {
    bringToFront(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const key = active.id as string;
    const currentOffset = store.getState().offsets[key] || { x: 0, y: 0 };
    updateOffset(key, currentOffset.x + delta.x, currentOffset.y + delta.y);
  };

  const activeEntries = [
    ...floating.map((entry) => ({ entry, isPinned: true })),
    ...trail.map((entry) => ({ entry, isPinned: false })),
  ];

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={computedModifiers}>
      <div ref={containerRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        {activeEntries.map(({ entry, isPinned }, idx) => (
          <div key={entry.key} style={{ pointerEvents: 'auto' }}>
            {children({
              entry,
              index: isPinned ? idx : floating.length + trail.indexOf(entry),
              isPinned,
            })}
          </div>
        ))}
      </div>
    </DndContext>
  );
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
  /** True to allow dragging (default: true). */
  enableDrag?: boolean;
  /** True to enable spring rotation physics (default: true). */
  enableTilt?: boolean;
  /** Set true to enable React Focus Lock when this card is topmost (default: true). */
  enableFocusLock?: boolean;
  /** Custom drag handle trigger element. If not specified, the entire card is draggable. */
  dragHandle?: (props: React.HTMLAttributes<HTMLElement>) => ReactNode;
}

/**
 * High-level pre-bound PopoverCard component that handles hooks, refs, styles,
 * dragging physics, focus locks, and event bindings automatically.
 *
 * @template TData - The resolved data payload type.
 */
export function PopoverCard<TData = unknown>({
  entry,
  index,
  isPinned,
  placement = 'bottom',
  children,
  className = 'popover-card',
  style: customStyle,
  enableDrag = true,
  enableTilt = true,
  enableFocusLock = true,
  dragHandle,
}: PopoverCardProps<TData>) {
  const {
    ref,
    style,
    isTop,
    isDragging,
    actions,
    dragHandleProps,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    transitionClassName,
  } = usePopoverDraggableCard({
    entry: entry as TrailEntry,
    index,
    isPinned,
    placement,
    enableDrag,
    enableTilt,
  });

  const combinedClassName = [
    className,
    isTop ? 'topmost' : '',
    isPinned ? 'pinned' : '',
    isDragging ? 'dragging' : '',
    transitionClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const resolvedDragHandleProps = isPinned ? {} : dragHandleProps;

  return (
    <div
      ref={ref}
      style={{
        ...style,
        ...(entry.exitTransitionDuration !== undefined
          ? { transitionDuration: `${entry.exitTransitionDuration}ms` }
          : {}),
        ...customStyle,
      }}
      role="dialog"
      aria-labelledby={`title-${entry.key}`}
      aria-describedby={entry.ariaDescribedby ? `desc-${entry.key}` : undefined}
      className={combinedClassName}
      onMouseDown={() => actions.bringToFront(entry.key)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
    >
      <FocusLock disabled={!enableFocusLock || !isTop || isPinned} returnFocus>
        {entry.ariaDescribedby && (
          <div id={`desc-${entry.key}`} style={{ display: 'none' }}>
            {entry.ariaDescribedby}
          </div>
        )}

        {dragHandle ? (
          <>
            {dragHandle(resolvedDragHandleProps)}
            {children}
          </>
        ) : (
          <div {...resolvedDragHandleProps} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
        )}
      </FocusLock>
    </div>
  );
}
