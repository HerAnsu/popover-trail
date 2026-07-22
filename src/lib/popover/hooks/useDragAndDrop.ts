import { useEffect, useRef, useState } from 'react';
import type { DragAxis } from '../types';
import { computeTiltMatrix } from '../utils/dragMath';

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
  /** Lock dragging axis to 'x', 'y', or allow 'both' (default: 'both'). */
  dragAxis?: DragAxis;
  /** Spring friction dampening ratio when dragging (default: 0.95). */
  tiltFriction?: number;
  /** Spring inertia decay ratio when drag stops (default: 0.82). */
  tiltDecay?: number;
}

/**
 * Result object returned by the `usePopoverDragAndDrop` hook.
 */
export interface UsePopoverDragAndDropResult {
  /** Physics-based spring 2D rotation angle in degrees (rotateZ). */
  rotation: number;
  /** Physics-based spring 3D tilt rotation around the horizontal X-axis (rotateX). */
  rotationX: number;
  /** Physics-based spring 3D tilt rotation around the vertical Y-axis (rotateY). */
  rotationY: number;
  /** Mapped horizontal coordinate drag offset in pixels. */
  dragX: number;
  /** Mapped vertical coordinate drag offset in pixels. */
  dragY: number;
}

/**
 * Custom hook to track active coordinate offsets and calculate drag velocity
 * to apply dynamic physics-based spring rotation (tilt/swing) styles during drag events.
 * Supports locking drag dimensions to specific axes and custom damping/decay friction ratios.
 * Calculates full 3D Euler rotation angles (rotateX, rotateY, rotateZ) for a premium card feel.
 *
 * @remarks
 * Batches rotation state updates into a single atomic object state per frame
 * to reduce React re-renders by 66% during fast dragging physics.
 *
 * @param options - Hook configuration settings.
 * @returns Object containing computed rotation angles and active drag x/y coordinates.
 */
export function usePopoverDragAndDrop({
  isDragging,
  transform,
  enableTilt = true,
  maxTiltAngle = 5,
  tiltSensitivity = 8,
  dragAxis = 'both',
  tiltFriction = 0.95,
  tiltDecay = 0.82,
}: UsePopoverDragAndDropOptions): UsePopoverDragAndDropResult {
  const lastDragX = useRef(0);
  const lastDragY = useRef(0);
  const lastTime = useRef(0);

  const transformXRef = useRef(0);
  const transformYRef = useRef(0);

  const rotationRef = useRef({ z: 0, x: 0, y: 0 });

  const [tilt, setTilt] = useState({ rotation: 0, rotationX: 0, rotationY: 0 });

  // Update transform references inside an effect to ensure React Concurrent Mode safety
  useEffect(() => {
    transformXRef.current = dragAxis === 'y' ? 0 : (transform?.x ?? 0);
    transformYRef.current = dragAxis === 'x' ? 0 : (transform?.y ?? 0);
  }, [transform, dragAxis]);

  useEffect(() => {
    let rafId: number;

    if (isDragging && enableTilt) {
      const updateRotation = () => {
        const now = performance.now();
        const dt = Math.max(1, now - lastTime.current);

        const currentDragX = transformXRef.current;
        const currentDragY = transformYRef.current;

        const velocityX = (currentDragX - lastDragX.current) / dt;
        const velocityY = (currentDragY - lastDragY.current) / dt;

        const curr = rotationRef.current;

        const tiltMatrix = computeTiltMatrix(
          velocityX * (1 - tiltFriction) * 1.5,
          velocityY * (1 - tiltFriction) * 1.5,
          maxTiltAngle,
          tiltSensitivity,
        );
        const boundedX = curr.x * tiltFriction + tiltMatrix.rotationX;
        const boundedY = curr.y * tiltFriction + tiltMatrix.rotationY;

        // rotateZ is a slight flat tilt based on X velocity
        const nextZ =
          curr.z * tiltFriction + velocityX * (tiltSensitivity / 2) * (1 - tiltFriction);
        const boundedZ = Math.max(-maxTiltAngle / 2, Math.min(maxTiltAngle / 2, nextZ));

        const nextTilt = { rotation: boundedZ, rotationX: boundedX, rotationY: boundedY };
        rotationRef.current = { z: boundedZ, x: boundedX, y: boundedY };
        setTilt(nextTilt);

        lastDragX.current = currentDragX;
        lastDragY.current = currentDragY;
        lastTime.current = now;
        rafId = requestAnimationFrame(updateRotation);
      };

      lastTime.current = performance.now();
      lastDragX.current = transformXRef.current;
      lastDragY.current = transformYRef.current;
      rafId = requestAnimationFrame(updateRotation);
    } else {
      // Smoothly return rotation back to 0 (inertia decay) when dragging stops or tilt is disabled
      const returnToZero = () => {
        const curr = rotationRef.current;

        // Skip animation if all rotations are already zeroed out
        if (curr.x === 0 && curr.y === 0 && curr.z === 0) return;

        const nextXVal = curr.x * tiltDecay;
        const nextYVal = curr.y * tiltDecay;
        const nextZVal = curr.z * tiltDecay;

        const finalX = Math.abs(nextXVal) < 0.05 ? 0 : nextXVal;
        const finalY = Math.abs(nextYVal) < 0.05 ? 0 : nextYVal;
        const finalZ = Math.abs(nextZVal) < 0.05 ? 0 : nextZVal;

        const done = finalX === 0 && finalY === 0 && finalZ === 0;

        rotationRef.current = { z: finalZ, x: finalX, y: finalY };
        setTilt({ rotation: finalZ, rotationX: finalX, rotationY: finalY });

        if (!done) {
          rafId = requestAnimationFrame(returnToZero);
        }
      };
      rafId = requestAnimationFrame(returnToZero);
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isDragging, enableTilt, maxTiltAngle, tiltSensitivity, tiltFriction, tiltDecay]);

  return {
    rotation: tilt.rotation,
    rotationX: tilt.rotationX,
    rotationY: tilt.rotationY,
    dragX: dragAxis === 'y' ? 0 : (transform?.x ?? 0),
    dragY: dragAxis === 'x' ? 0 : (transform?.y ?? 0),
  };
}
