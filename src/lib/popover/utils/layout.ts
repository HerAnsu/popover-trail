export interface BasePositionParams {
  anchorRect: DOMRect
  popoverWidth: number
  popoverHeight: number
  direction: 'up' | 'down'
  zIndex: number
  viewport: { width: number; height: number }
  gap: number
  margin: number
}

/**
 * Calculates the absolute viewport coordinates (top, left) for positioning a popover.
 * Automatically handles viewport collision and flips directions if needed.
 */
export function calculateBasePosition({
  anchorRect,
  popoverWidth,
  popoverHeight,
  direction,
  zIndex,
  viewport,
  gap,
  margin,
}: BasePositionParams): { top: number; left: number } {
  let idealTop = 0
  const idealLeft = anchorRect.left + (anchorRect.width - popoverWidth) / 2

  // Determine vertical placement
  if (direction === 'down') {
    idealTop = anchorRect.bottom + gap
    // Collision detection: if it goes below viewport, flip to 'up'
    if (idealTop + popoverHeight > viewport.height - margin) {
      const alternativeTop = anchorRect.top - popoverHeight - gap
      if (alternativeTop >= margin) {
        idealTop = alternativeTop
      }
    }
  } else {
    idealTop = anchorRect.top - popoverHeight - gap
    // Collision detection: if it goes above viewport, flip to 'down'
    if (idealTop < margin) {
      const alternativeTop = anchorRect.bottom + gap
      if (alternativeTop + popoverHeight <= viewport.height - margin) {
        idealTop = alternativeTop
      }
    }
  }

  // Constrain coordinates to viewport margins
  const constrainedLeft = Math.max(
    margin,
    Math.min(viewport.width - popoverWidth - margin, idealLeft)
  )
  const constrainedTop = Math.max(
    margin,
    Math.min(viewport.height - popoverHeight - margin, idealTop)
  )

  // Apply slight horizontal cascade offset based on zIndex/nesting level to improve overlap aesthetics
  const finalLeft = constrainedLeft + zIndex * 8

  return {
    top: constrainedTop,
    left: finalLeft,
  }
}
