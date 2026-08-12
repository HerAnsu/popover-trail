import React, { useEffect, useRef, useDebugValue } from 'react';
import type { DragAxis } from '../types';
import { computeTiltMatrix } from '../utils/dragMath';
import { validateDragOffset } from '../utils/devWarnings';

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
  /** Ref to the card DOM element for direct CSS manipulation. */
  cardRef?: React.RefObject<HTMLElement | null>;
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

class ReducedMotionObserverImpl {
  private matches = false;
  private listeners = new Set<() => void>();

  constructor() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.matches = mediaQuery.matches;
      const listener = (e: MediaQueryListEvent) => {
        this.matches = e.matches;
        this.listeners.forEach((cb) => cb());
      };
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', listener);
      } else if (
        typeof (mediaQuery as unknown as { addListener?: (l: unknown) => void }).addListener ===
        'function'
      ) {
        (mediaQuery as unknown as { addListener: (l: unknown) => void }).addListener(listener);
      }
    }
  }

  get isReducedMotion(): boolean {
    return this.matches;
  }

  subscribe = (callback: () => void): (() => void) => {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  };
}

const ReducedMotionObserver = new ReducedMotionObserverImpl();

/**
 * Custom hook to track active coordinate offsets and calculate drag velocity
 * to apply dynamic physics-based spring rotation (tilt/swing) styles during drag events.
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
  cardRef,
}: UsePopoverDragAndDropOptions): UsePopoverDragAndDropResult {
  const lastDragX = useRef(0);
  const lastDragY = useRef(0);
  const lastTime = useRef(0);

  const transformXRef = useRef(0);
  const transformYRef = useRef(0);

  const rotationRef = useRef({ z: 0, x: 0, y: 0 });

  useEffect(() => {
    transformXRef.current = dragAxis === 'y' ? 0 : (transform?.x ?? 0);
    transformYRef.current = dragAxis === 'x' ? 0 : (transform?.y ?? 0);
  }, [transform, dragAxis]);

  const prefersReducedMotion = React.useSyncExternalStore(
    ReducedMotionObserver.subscribe,
    () => ReducedMotionObserver.isReducedMotion,
    () => false,
  );

  useEffect(() => {
    let rafId: number;

    // Early Guard Clause 1: Handle inertia decay when drag stops or tilt is disabled
    if (!isDragging || !enableTilt || prefersReducedMotion) {
      const curr = rotationRef.current;
      if (curr.x === 0 && curr.y === 0 && curr.z === 0) return;

      const returnToZero = () => {
        const c = rotationRef.current;
        if (c.x === 0 && c.y === 0 && c.z === 0) return;

        const safeDecay = Math.min(Math.max(tiltDecay, 0.1), 0.99);
        const finalX = Math.abs(c.x * safeDecay) < 0.05 ? 0 : c.x * safeDecay;
        const finalY = Math.abs(c.y * safeDecay) < 0.05 ? 0 : c.y * safeDecay;
        const finalZ = Math.abs(c.z * safeDecay) < 0.05 ? 0 : c.z * safeDecay;

        const done = finalX === 0 && finalY === 0 && finalZ === 0;
        rotationRef.current = { z: finalZ, x: finalX, y: finalY };

        const el = cardRef?.current;
        if (el) {
          el.style.setProperty('--pt-rotate-z', done ? '0deg' : `${finalZ}deg`);
          el.style.setProperty('--pt-rotate-x', done ? '0deg' : `${finalX}deg`);
          el.style.setProperty('--pt-rotate-y', done ? '0deg' : `${finalY}deg`);
        }

        if (!done) {
          rafId = requestAnimationFrame(returnToZero);
        }
      };

      rafId = requestAnimationFrame(returnToZero);
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    // Active Drag Spring Rotation Animation Frame Loop
    const updateRotation = () => {
      const now = performance.now();
      const dt = Math.max(1, now - lastTime.current);
      const frameRatio = dt / 16.667;

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
      const safeFriction = Math.pow(tiltFriction, frameRatio);
      const boundedX = curr.x * safeFriction + tiltMatrix.rotationX;
      const boundedY = curr.y * safeFriction + tiltMatrix.rotationY;

      const nextZ = curr.z * safeFriction + velocityX * (tiltSensitivity / 2) * (1 - tiltFriction);
      const boundedZ = Math.max(-maxTiltAngle / 2, Math.min(maxTiltAngle / 2, nextZ));

      rotationRef.current = { z: boundedZ, x: boundedX, y: boundedY };
      const el = cardRef?.current;
      if (el) {
        el.style.setProperty('--pt-rotate-z', `${boundedZ}deg`);
        el.style.setProperty('--pt-rotate-x', `${boundedX}deg`);
        el.style.setProperty('--pt-rotate-y', `${boundedY}deg`);
      }

      lastDragX.current = currentDragX;
      lastDragY.current = currentDragY;
      lastTime.current = now;
      rafId = requestAnimationFrame(updateRotation);
    };

    lastTime.current = performance.now();
    lastDragX.current = transformXRef.current;
    lastDragY.current = transformYRef.current;
    rafId = requestAnimationFrame(updateRotation);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    isDragging,
    enableTilt,
    maxTiltAngle,
    tiltSensitivity,
    tiltFriction,
    tiltDecay,
    cardRef,
    prefersReducedMotion,
  ]);

  const dragX = dragAxis === 'y' ? 0 : (transform?.x ?? 0);
  const dragY = dragAxis === 'x' ? 0 : (transform?.y ?? 0);

  validateDragOffset(dragX, dragY);
  useDebugValue(
    isDragging
      ? `Dragging [x: ${dragX.toFixed(0)}, y: ${dragY.toFixed(0)}, tilt: ${rotationRef.current.z.toFixed(1)}°]`
      : 'Idle',
  );

  return {
    rotation: rotationRef.current.z,
    rotationX: rotationRef.current.x,
    rotationY: rotationRef.current.y,
    dragX,
    dragY,
  };
}
