import { useRef } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { usePopoverGeometry } from './useGeometry'
import { usePopoverDragAndDrop } from './useDragAndDrop'
import {
  usePopoverOffset,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverActions,
} from '../context'
import { getPopoverStyles } from '../utils/styles'
import type { TrailEntry, PopoverPlacement } from '../types'

interface UsePopoverCardOptions {
  entry: TrailEntry
  index: number
  isPinned: boolean
  placement?: PopoverPlacement
}

/**
 * A unified helper hook that encapsulates all layout positioning, dragging physics,
 * z-index ordering, topmost check, and actions into a single simple interface.
 */
export function usePopoverCard({
  entry,
  index,
  isPinned,
  placement = 'bottom',
}: UsePopoverCardOptions) {
  const ref = useRef<HTMLDivElement | null>(null)

  // 1. Set up dnd-kit dragging
  const { setNodeRef, transform, isDragging, attributes, listeners } = useDraggable({
    id: entry.key,
  })

  // 2. Physics-based rotation swing setup
  const { rotation, dragX, dragY } = usePopoverDragAndDrop({
    isDragging,
    transform,
  })

  // 3. Geometry positioning setup
  const { finalLayoutPos } = usePopoverGeometry({
    id: entry.key,
    anchorRect: entry.rect,
    placement,
    zIndex: index,
    ref,
    isDragging,
    isPinned,
    entry,
  })

  // 4. Select state coordinates and actions
  const offset = usePopoverOffset(entry.key)
  const zIndex = usePopoverZIndex(entry.key)
  const isTop = useIsPopoverTopMost(entry.key)
  const actions = usePopoverActions()

  // 5. Compile styles using the compiler utility
  const style = getPopoverStyles({
    finalLayoutPos,
    offset,
    dragX,
    dragY,
    rotation,
    zIndex: zIndex + 1000,
  })

  const setCombinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node)
    ref.current = node
  }

  const handlePinToggle = () => {
    if (ref.current) {
      const currentRect = ref.current.getBoundingClientRect()
      actions.togglePin(entry.key, currentRect)
    }
  }

  return {
    ref: setCombinedRef,
    style,
    isTop,
    isDragging,
    actions,
    dragHandleProps: { ...attributes, ...listeners },
    handlePinToggle,
  }
}
