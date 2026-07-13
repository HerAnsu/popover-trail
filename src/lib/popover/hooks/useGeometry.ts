import { useEffect, useState, useMemo, type RefObject } from 'react'
import { useFloating, offset, flip, shift } from '@floating-ui/react'
import type { TrailEntry, PopoverPlacement } from '../types'

interface UsePopoverGeometryOptions {
  id: string
  anchorRect?: DOMRect
  placement?: PopoverPlacement
  zIndex: number
  onPosition?: () => void
  ref: RefObject<HTMLDivElement | null>
  isDragging: boolean
  isPinned: boolean
  entry?: TrailEntry
}

export function usePopoverGeometry({
  id,
  anchorRect,
  placement,
  zIndex,
  onPosition,
  ref,
  isDragging,
  isPinned,
  entry,
}: UsePopoverGeometryOptions) {
  const [resizeVersion, setResizeVersion] = useState(0)

  // 1. Setup a virtual element for Floating UI positioning using the anchor DOMRect
  const virtualElement = useMemo(() => {
    if (!anchorRect) return null
    return {
      getBoundingClientRect: () => anchorRect,
    }
  }, [anchorRect])

  // 2. Configure useFloating positioning middleware
  const { refs, x, y, update } = useFloating({
    placement: placement ?? 'bottom',
    middleware: [
      offset(8), // Gap distance from trigger
      flip(), // Collision fallback (automatically flips opposite)
      shift({ padding: 12 }), // Keep within viewport margins
    ],
  })

  // 3. Keep references synced
  useEffect(() => {
    if (virtualElement) {
      refs.setReference(virtualElement)
    }
  }, [virtualElement, refs])

  useEffect(() => {
    if (ref.current) {
      refs.setFloating(ref.current)
    }
  }, [ref, refs])

  // 4. Update positioning on size/resize changes using standard ResizeObserver
  useEffect(() => {
    if (!ref.current) return
    const currentRef = ref.current

    const observer = new ResizeObserver(() => {
      setResizeVersion((v) => v + 1)
      void update()
      if (onPosition) onPosition()
    })

    observer.observe(currentRef)
    window.addEventListener('resize', update)

    return () => {
      observer.unobserve(currentRef)
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [ref, update, onPosition])

  // 5. Force updates when specific inputs change
  useEffect(() => {
    void update()
  }, [id, anchorRect, placement, zIndex, isDragging, isPinned, entry?.pinnedLayoutPos, update])

  // 6. Calculate the final coordinates
  const finalLayoutPos = useMemo(() => {
    if (isPinned && entry?.pinnedLayoutPos) {
      return entry.pinnedLayoutPos
    }
    // Add slight horizontal cascade offset based on zIndex/nesting level to improve overlap aesthetics
    const cascadeOffset = zIndex * 8
    return {
      top: y ?? 0,
      left: (x ?? 0) + cascadeOffset,
    }
  }, [isPinned, entry?.pinnedLayoutPos, x, y, zIndex])

  return {
    dimensions: { width: ref.current?.offsetWidth ?? 0, height: ref.current?.offsetHeight ?? 0 },
    finalLayoutPos,
    resizeVersion,
  }
}
