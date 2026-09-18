import type { PopoverRect } from '../../../types';
import { isFiniteRect } from '../../../utils/typeGuards';

export interface PinnedLayoutCoordinates {
  readonly top: number;
  readonly left: number;
}

/**
 * Resolves pinned layout coordinates ensuring finite float numbers.
 *
 * @example
 * ```ts
 * const pos = resolvePinnedLayoutPos(rect, entry);
 * if (pos) {
 *   console.log(`Pinned at top: ${pos.top}, left: ${pos.left}`);
 * }
 * ```
 *
 * @param rect - Optional active or trigger bounding rect.
 * @param entry - Optional existing entry containing prior pinnedLayoutPos or rect.
 * @returns Bounded `{ top, left }` pinned coordinates, or undefined if not determinable.
 */
export function resolvePinnedLayoutPos(
  rect?: DOMRect | PopoverRect | null,
  entry?: {
    readonly pinnedLayoutPos?: PinnedLayoutCoordinates;
    readonly rect?: DOMRect | PopoverRect | null;
  },
): PinnedLayoutCoordinates | undefined {
  if (isFiniteRect(rect)) {
    return { top: rect.top, left: rect.left };
  }
  const { pinnedLayoutPos, rect: entryRect } = entry ?? {};
  if (pinnedLayoutPos) {
    return pinnedLayoutPos;
  }
  if (isFiniteRect(entryRect)) {
    return { top: entryRect.top, left: entryRect.left };
  }
  return undefined;
}
