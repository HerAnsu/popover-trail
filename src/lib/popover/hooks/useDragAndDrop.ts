import { useEffect, useRef, useState } from "react";

/**
 * Options parameters for the `usePopoverDragAndDrop` hook.
 */
interface UsePopoverDragAndDropOptions {
  /** True if the popover card is currently being dragged. */
  isDragging: boolean;
  /** Current dnd-kit transform offset coordinates. */
  transform: { x: number; y: number } | null;
  /** True to enable physical spring rotation (tilt/swing) effects when dragging. */
  enableTilt?: boolean;
  /** Maximum tilt swing angle in degrees (default: 5). */
  maxTiltAngle?: number;
  /** Factor scaling tilt response to drag velocity (default: 8). */
  tiltSensitivity?: number;
}

/**
 * Custom hook to track active coordinate offsets and calculate drag velocity
 * to apply dynamic physics-based spring rotation (tilt/swing) styles during drag events.
 *
 * @remarks
 * Uses a requestAnimationFrame loop to continuously decay rotation spring tension,
 * ensuring high performance. Ref mutations are isolated to effects to ensure complete
 * compatibility with React 18/19 Concurrent Mode.
 *
 * @param options - Hook configuration settings.
 * @returns Object containing computed rotation angle in degrees and active drag x/y coordinates.
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
