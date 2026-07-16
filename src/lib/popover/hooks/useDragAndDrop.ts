import { useEffect, useRef, useState } from 'react';

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
  dragAxis?: 'x' | 'y' | 'both';
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
  dragAxis = 'both',
  tiltFriction = 0.95,
  tiltDecay = 0.82,
}: UsePopoverDragAndDropOptions): UsePopoverDragAndDropResult {
  const lastDragX = useRef(0);
  const lastDragY = useRef(0);
  const lastTime = useRef(0);

  const transformXRef = useRef(0);
  const transformYRef = useRef(0);

  const rotationRef = useRef(0);
  const rotationXRef = useRef(0);
  const rotationYRef = useRef(0);

  const [rotation, setRotation] = useState(0);
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);

  // Update transform references inside an effect to ensure React Concurrent Mode safety
  useEffect(() => {
    transformXRef.current = dragAxis === 'y' ? 0 : (transform?.x ?? 0);
    transformYRef.current = dragAxis === 'x' ? 0 : (transform?.y ?? 0);
  }, [transform, dragAxis]);

  useEffect(() => {
    rotationRef.current = rotation;
    rotationXRef.current = rotationX;
    rotationYRef.current = rotationY;
  }, [rotation, rotationX, rotationY]);

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

        // rotateY is affected by horizontal velocity X
        const nextY = rotationYRef.current * tiltFriction + velocityX * tiltSensitivity * (1 - tiltFriction) * 1.5;
        const boundedY = Math.max(-maxTiltAngle, Math.min(maxTiltAngle, nextY));
        setRotationY(boundedY);
        rotationYRef.current = boundedY;

        // rotateX is affected by vertical velocity Y
        const nextX = rotationXRef.current * tiltFriction - velocityY * tiltSensitivity * (1 - tiltFriction) * 1.5;
        const boundedX = Math.max(-maxTiltAngle, Math.min(maxTiltAngle, nextX));
        setRotationX(boundedX);
        rotationXRef.current = boundedX;

        // rotateZ is a slight flat tilt based on X velocity
        const nextZ = rotationRef.current * tiltFriction + velocityX * (tiltSensitivity / 2) * (1 - tiltFriction);
        const boundedZ = Math.max(-maxTiltAngle / 2, Math.min(maxTiltAngle / 2, nextZ));
        setRotation(boundedZ);
        rotationRef.current = boundedZ;

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
        const currX = rotationXRef.current;
        const currY = rotationYRef.current;
        const currZ = rotationRef.current;

        const nextX = currX * tiltDecay;
        const nextY = currY * tiltDecay;
        const nextZ = currZ * tiltDecay;

        let done = true;

        if (Math.abs(nextX) < 0.05) {
          setRotationX(0);
          rotationXRef.current = 0;
        } else {
          setRotationX(nextX);
          rotationXRef.current = nextX;
          done = false;
        }

        if (Math.abs(nextY) < 0.05) {
          setRotationY(0);
          rotationYRef.current = 0;
        } else {
          setRotationY(nextY);
          rotationYRef.current = nextY;
          done = false;
        }

        if (Math.abs(nextZ) < 0.05) {
          setRotation(0);
          rotationRef.current = 0;
        } else {
          setRotation(nextZ);
          rotationRef.current = nextZ;
          done = false;
        }

        if (!done) {
          rafId = requestAnimationFrame(returnToZero);
        }
      };
      rafId = requestAnimationFrame(returnToZero);
    }

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [isDragging, enableTilt, maxTiltAngle, tiltSensitivity, tiltFriction, tiltDecay]);

  const dragX = dragAxis === 'y' ? 0 : (transform?.x ?? 0);
  const dragY = dragAxis === 'x' ? 0 : (transform?.y ?? 0);

  return {
    rotation,
    rotationX,
    rotationY,
    dragX,
    dragY,
  };
}
