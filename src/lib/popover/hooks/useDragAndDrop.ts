import { useEffect, useRef, useState } from 'react'

interface UsePopoverDragAndDropOptions {
  isDragging: boolean
  transform: { x: number; y: number } | null
  enableTilt?: boolean
  maxTiltAngle?: number
  tiltSensitivity?: number
}

/**
 * Hook to track dragging offsets and calculate horizontal drag velocity 
 * for physics-based spring rotation (tilt/swing).
 */
export function usePopoverDragAndDrop({
  isDragging,
  transform,
  enableTilt = true,
  maxTiltAngle = 5,
  tiltSensitivity = 8,
}: UsePopoverDragAndDropOptions) {
  const lastDragX = useRef(0)
  const lastTime = useRef(0)
  const transformXRef = useRef(0)
  const [rotation, setRotation] = useState(0)

  // Update transform reference synchronously in render phase to avoid effect latency
  transformXRef.current = transform?.x ?? 0

  useEffect(() => {
    let rafId: number

    if (isDragging && enableTilt) {
      const updateRotation = () => {
        const now = performance.now()
        const dt = Math.max(1, now - lastTime.current)
        const currentDragX = transformXRef.current
        const velocity = (currentDragX - lastDragX.current) / dt

        setRotation((prev) => {
          const next = prev * 0.95 + velocity * tiltSensitivity * 0.05
          return Math.max(-maxTiltAngle, Math.min(maxTiltAngle, next))
        })

        lastDragX.current = currentDragX
        lastTime.current = now
        rafId = requestAnimationFrame(updateRotation)
      }

      lastTime.current = performance.now()
      lastDragX.current = transformXRef.current
      rafId = requestAnimationFrame(updateRotation)
    } else {
      // Smoothly return rotation back to 0 (inertia decay) when dragging stops or tilt is disabled
      const returnToZero = () => {
        setRotation((prev) => {
          if (Math.abs(prev) < 0.05) return 0
          rafId = requestAnimationFrame(returnToZero)
          return prev * 0.82
        })
      }
      rafId = requestAnimationFrame(returnToZero)
    }

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [isDragging, enableTilt, maxTiltAngle, tiltSensitivity])

  const dragX = transform?.x ?? 0
  const dragY = transform?.y ?? 0

  return {
    rotation,
    dragX,
    dragY,
  }
}
