import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { calculateBasePosition } from '../utils/layout'
import type { TrailEntry } from '../types'

interface UsePopoverGeometryOptions {
  id: string
  anchorRect?: DOMRect
  direction: 'up' | 'down'
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
  direction,
  zIndex,
  onPosition,
  ref,
  isDragging,
  isPinned,
  entry,
}: UsePopoverGeometryOptions) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [resizeVersion, setResizeVersion] = useState(0)
  const [layoutPos, setLayoutPos] = useState({ top: 0, left: -9999 })

  useEffect(() => {
    const handleResize = () => {
      setResizeVersion((v) => v + 1)
    }
    window.addEventListener('resize', handleResize)

    let observer: ResizeObserver | undefined
    const currentRef = ref.current

    if (typeof ResizeObserver !== 'undefined' && currentRef) {
      observer = new ResizeObserver((entries) => {
        for (const resizeEntry of entries) {
          const { width, height } = resizeEntry.contentRect
          setDimensions((prev) => {
            if (prev.width === width && prev.height === height) {
              return prev
            }
            setResizeVersion((v) => v + 1)
            return { width, height }
          })
        }
      })
      observer.observe(currentRef)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (observer && currentRef) {
        observer.unobserve(currentRef)
      }
      observer?.disconnect()
    }
  }, [ref])

  const finalLayoutPos = isPinned && entry?.pinnedLayoutPos ? entry.pinnedLayoutPos : layoutPos

  useLayoutEffect(() => {
    if (isDragging) return
    if (!ref.current) return

    const el = ref.current
    const rect = el.getBoundingClientRect()
    const popoverWidth = dimensions.width || rect.width
    const popoverHeight = dimensions.height || rect.height

    let baseTop = 0
    let baseLeft = 0

    if (isPinned && entry?.pinnedLayoutPos) {
      baseTop = entry.pinnedLayoutPos.top
      baseLeft = entry.pinnedLayoutPos.left
    } else if (anchorRect) {
      const basePos = calculateBasePosition({
        anchorRect,
        popoverWidth,
        popoverHeight,
        direction,
        zIndex,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        gap: 8,
        margin: 12,
      })
      baseTop = basePos.top
      baseLeft = basePos.left
    } else {
      // Fallback centering if no anchor is set
      baseTop = (window.innerHeight - popoverHeight) / 2
      baseLeft = (window.innerWidth - popoverWidth) / 2
    }

    setLayoutPos((prev) => {
      if (prev.top === baseTop && prev.left === baseLeft) {
        return prev
      }
      return { top: baseTop, left: baseLeft }
    })

    if (onPosition) {
      onPosition()
    }
  }, [
    id,
    anchorRect,
    direction,
    zIndex,
    isDragging,
    isPinned,
    entry?.pinnedLayoutPos,
    dimensions.width,
    dimensions.height,
    resizeVersion,
    ref,
  ])

  return {
    dimensions,
    finalLayoutPos,
    resizeVersion,
  }
}
