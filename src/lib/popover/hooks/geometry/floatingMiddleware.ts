/**
 * Floating UI Middleware Builder and Collision Config Resolver.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/geometry/floatingMiddleware
 */

import { offset, flip, shift, size, type Boundary } from '@floating-ui/react';
import { resolveMiddlewareProps } from './geometryUtils';
import { useResolvedBoundary } from './useResolvedBoundary';
import type { CollisionConfig } from '../../types';

/**
 * Builds the array of Floating UI middlewares (offset, flip, shift, size) based on configuration options.
 *
 * @param offsetDistance - Distance in pixels from the anchor element.
 * @param flipOption - Flip behavior toggle or extra configuration options.
 * @param shiftOption - Shift behavior toggle or extra configuration options.
 * @param sizeOption - Size clamping options or boolean.
 * @param boundaryOption - Boundary DOM element or clipping rect.
 * @param padding - Viewport padding boundaries.
 * @returns Array of configured Floating UI middleware.
 *
 * @example
 * ```typescript
 * const middleware = buildFloatingMiddleware(8, true, true, false, undefined, 12);
 * ```
 */
export function buildFloatingMiddleware(
  offsetDistance: number,
  flipOption: unknown,
  shiftOption: unknown,
  sizeOption: unknown,
  boundaryOption: Boundary | undefined,
  padding: number | { top?: number; right?: number; bottom?: number; left?: number } | undefined,
) {
  const list = [offset(offsetDistance)];

  if (flipOption !== false) {
    list.push(
      flip({
        boundary: boundaryOption,
        padding: padding ?? undefined,
        ...resolveMiddlewareProps(flipOption),
      }),
    );
  }

  if (shiftOption !== false) {
    list.push(
      shift({
        boundary: boundaryOption,
        padding: padding ?? 12,
        ...resolveMiddlewareProps(shiftOption),
      }),
    );
  }

  if (sizeOption) {
    list.push(
      size({
        boundary: boundaryOption,
        padding: padding ?? 12,
        apply({ availableWidth, availableHeight, elements }) {
          elements.floating.style.setProperty('--popover-max-width', `${availableWidth}px`);
          elements.floating.style.setProperty('--popover-max-height', `${availableHeight}px`);
        },
        ...resolveMiddlewareProps(sizeOption),
      }),
    );
  }

  return list;
}

/**
 * Merges entry-level collision configuration with global provider defaults.
 *
 * Resolves boundary references (DOM element, selector, or viewport).
 *
 * @param localCollision - Card-specific collision configuration overrides.
 * @param globalCollision - Provider-wide default collision configuration.
 * @returns Consolidated collision options object.
 *
 * @example
 * ```tsx
 * const { padding, flipOption, shiftOption, boundaryOption } = useMergedCollisionConfig(
 *   entry?.collision,
 *   globalCollision,
 * );
 * ```
 */
export function useMergedCollisionConfig(
  localCollision?: CollisionConfig | null,
  globalCollision?: CollisionConfig | null,
) {
  const boundary = localCollision?.boundary ?? globalCollision?.boundary;
  const boundaryOption = useResolvedBoundary(boundary);
  const merged = { ...globalCollision, ...localCollision };

  return {
    padding: merged.padding,
    flipOption: merged.flip,
    shiftOption: merged.shift,
    sizeOption: merged.size,
    boundaryOption,
  };
}
