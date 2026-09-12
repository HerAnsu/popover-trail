/**
 * Floating UI Middleware Builder and Collision Config Resolver.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/geometry/floatingMiddleware
 */

import { offset, flip, shift, size, type Boundary } from '@floating-ui/react';
import { resolveMiddlewareExtraProps } from './geometryUtils';
import { useResolvedBoundary } from './useResolvedBoundary';
import type { CollisionConfig } from '../../types';

export function buildFloatingMiddlewareList(
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
        ...resolveMiddlewareExtraProps(flipOption),
      }),
    );
  }

  if (shiftOption !== false) {
    list.push(
      shift({
        boundary: boundaryOption,
        padding: padding ?? 12,
        ...resolveMiddlewareExtraProps(shiftOption),
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
        ...resolveMiddlewareExtraProps(sizeOption),
      }),
    );
  }

  return list;
}

export function useCollisionMergedConfig(
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
