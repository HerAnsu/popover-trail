import { useEffect, useRef, useState } from "react";

interface UsePopoverDragAndDropOptions {
  isDragging: boolean;
  transform: { x: number; y: number } | null;
  enableTilt?: boolean;
  maxTiltAngle?: number;
  tiltSensitivity?: number;
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
  const lastDragX = useRef(0);
  const lastTime = useRef(0);
  const transformXRef = useRef(0);
  const rotationRef = useRef(0);
  const [rotation, setRotation] = useState(0);

  // Update transform reference inside an effect to ensure React Concurrent Mode safety
  useEffect(() => {
    transformXRef.current = transform?.x ?? 0;
  }, [transform]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    let rafId: number;

    if (isDragging && enableTilt) {
      const updateRotation = () => {
        const now = performance.now();
        const dt = Math.max(1, now - lastTime.current);
        const currentDragX = transformXRef.current;
        const velocity = (currentDragX - lastDragX.current) / dt;

        const next = rotationRef.current * 0.95 + velocity * tiltSensitivity * 0.05;
        const bounded = Math.max(-maxTiltAngle, Math.min(maxTiltAngle, next));

        setRotation(bounded);
        rotationRef.current = bounded;

        lastDragX.current = currentDragX;
        lastTime.current = now;
        rafId = requestAnimationFrame(updateRotation);
      };

      lastTime.current = performance.now();
      lastDragX.current = transformXRef.current;
      rafId = requestAnimationFrame(updateRotation);
    } else {
      // Smoothly return rotation back to 0 (inertia decay) when dragging stops or tilt is disabled
      const returnToZero = () => {
        const current = rotationRef.current;
        const next = current * 0.82;
        if (Math.abs(next) < 0.05) {
          setRotation(0);
          rotationRef.current = 0;
          return;
        }
        setRotation(next);
        rotationRef.current = next;
        rafId = requestAnimationFrame(returnToZero);
      };
      rafId = requestAnimationFrame(returnToZero);
    }

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isDragging, enableTilt, maxTiltAngle, tiltSensitivity]);

  const dragX = transform?.x ?? 0;
  const dragY = transform?.y ?? 0;

  return {
    rotation,
    dragX,
    dragY,
  };
}
