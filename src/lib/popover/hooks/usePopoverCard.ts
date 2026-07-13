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
  enableDrag?: boolean
}

/**
 * A unified helper hook that encapsulates all layout positioning, dragging physics,
 * z-index ordering, topmost check, and actions into a single simple interface.
 * Supports disabling drag-and-drop dynamically.
 */
export function usePopoverCard({
  entry,
  index,
  isPinned,
  placement = 'bottom',
  enableDrag = true,
}: UsePopoverCardOptions) {
  const ref = useRef<HTMLDivElement | null>(null)

  // 1. Set up dnd-kit dragging (disabled if enableDrag is false or popover is not pinned)
  const { setNodeRef, transform, isDragging, attributes, listeners } = useDraggable({
    id: entry.key,
    disabled: !enableDrag || !isPinned,
  })

  // 2. Physics-based rotation swing setup
  const { rotation, dragX, dragY } = usePopoverDragAndDrop({
    isDragging: enableDrag ? isDragging : false,
    transform: enableDrag ? transform : null,
  })

  // 3. Geometry positioning setup
  const { finalLayoutPos } = usePopoverGeometry({
    id: entry.key,
    anchorRect: entry.rect,
    placement,
    zIndex: index,
    ref,
    isDragging: enableDrag ? isDragging : false,
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
    offset: enableDrag ? offset : { x: 0, y: 0 },
    dragX: enableDrag ? dragX : 0,
    dragY: enableDrag ? dragY : 0,
    rotation: enableDrag ? rotation : 0,
    zIndex: zIndex + 1000,
  })

  const setCombinedRef = (node: HTMLDivElement | null) => {
    if (enableDrag) {
      setNodeRef(node)
    }
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
    isDragging: enableDrag ? isDragging : false,
    actions,
    dragHandleProps: enableDrag ? { ...attributes, ...listeners } : {},
    handlePinToggle,
  }
}
