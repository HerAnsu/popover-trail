/**
 * Composite Draggable Card Hook integrating dnd-kit with spring physics.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/usePopoverDraggableCard
 */

import { useRef, useCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { usePopoverCard } from '../hooks/usePopoverCard';
import { usePopoverDragAndDrop } from '../hooks/useDragAndDrop';
import { usePopoverOffset } from '../hooks/usePopoverSelectors';
import { useMergedRef } from '../hooks/useHookUtils';
import { getPopoverStyles } from '../utils/styles';
import { extractNumericStyle } from '../utils/typeGuards';
import type { UsePopoverDraggableCardOptions, UsePopoverDraggableCardResult } from './dndTypes';
import {
  isDragPermitted,
  resolveTiltConfig,
  resolveDragTransform,
} from './dndCardConfig';

/**
 * Integrates dnd-kit draggable semantics, interactive tilt physics, and popover positioning for card components.
 * Automatically respects pin states, entry-level drag disabled toggles, and attaches draggable listeners.
 *
 * @param options - Draggable card options including entry, index, pin state, and tilt parameters.
 * @returns Result object containing `ref`, `style`, `isDragging`, `isDragAllowed`, `dragHandleProps`, and card actions.
 *
 * @example
 * ```tsx
 * function MyDraggableCard({ entry, index, isPinned }: Props) {
 *   const { ref, style, dragHandleProps } = usePopoverDraggableCard({
 *     entry,
 *     index,
 *     isPinned,
 *     enableDrag: true,
 *     enableTilt: true,
 *   });
 *
 *   return (
 *     <div ref={ref} style={style}>
 *       <div {...dragHandleProps}>Drag Me</div>
 *       <div>Content</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePopoverDraggableCard(
  options: UsePopoverDraggableCardOptions,
): UsePopoverDraggableCardResult {
  const {
    entry,
    index,
    isPinned,
    placement = 'bottom',
    enableDrag = true,
    enableTilt = true,
    maxTiltAngle = 5,
    tiltSensitivity = 8,
  } = options;
  const card = usePopoverCard({ entry, index, isPinned, placement });
  const isDragAllowed = isDragPermitted(
    entry,
    enableDrag,
    card.buttonControls.enableDrag,
    isPinned,
  );

  const { setNodeRef, transform, isDragging, attributes, listeners } = useDraggable({
    id: entry.key,
    disabled: !isDragAllowed,
  });

  const domRef = useRef<HTMLDivElement | null>(null);
  const tilt = resolveTiltConfig(entry, enableTilt, maxTiltAngle, tiltSensitivity);

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

  const offset = usePopoverOffset(entry.key);
  const dragTransforms = resolveDragTransform(isDragAllowed, offset, physics);

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
    const currentRect = domRef.current ? domRef.current.getBoundingClientRect() : undefined;
    card.actions.togglePin(entry.key, currentRect);
  }, [card.actions, entry.key]);

  return {
    ...card,
    ref: setCombinedRef,
    style,
    isDragging: isDragAllowed ? isDragging : false,
    isDragAllowed,
    dragHandleProps: isDragAllowed
      ? { ...attributes, ...listeners, style: { cursor: isDragging ? 'grabbing' : 'grab' } }
      : {},
    handlePinToggle,
  };
}
