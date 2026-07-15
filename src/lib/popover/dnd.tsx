/* eslint-disable react/only-export-components */
import { useCallback, useRef, type ReactNode } from 'react';
import { useDraggable, DndContext, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
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
  const { rotation, dragX, dragY } = usePopoverDragAndDrop({
    isDragging: isDragAllowed ? isDragging : false,
    transform: isDragAllowed ? transform : null,
    enableTilt,
    maxTiltAngle,
    tiltSensitivity,
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
    zIndex: (card.style.zIndex as number) - 1000,
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
}

/**
 * Reusable Canvas container that manages drag-and-drop context, coordinate offsets,
 * and z-index ordering for all active floating and trailing popover cards.
 *
 * @template TData - The resolved data payload type.
 * @param props - Component props containing the render prop children.
 * @returns The DndContext wrapper structure.
 */
export function PopoverCanvas<TData = unknown>({ children }: PopoverCanvasProps<TData>) {
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();
  const store = usePopoverStoreApi<TData>();
  const { updateOffset, bringToFront } = usePopoverActions<TData>();

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
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
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
