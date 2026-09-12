import type { PopoverRect } from '../../../types';
import { isFiniteRect } from '../../../utils/typeGuards';

export interface PinnedLayoutCoordinates {
  readonly top: number;
  readonly left: number;
}

/**
 * Resolves pinned layout coordinates ensuring finite float numbers.
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
  if (entry?.pinnedLayoutPos) {
    return entry.pinnedLayoutPos;
  }
  if (isFiniteRect(entry?.rect)) {
    return { top: entry.rect.top, left: entry.rect.left };
  }
  return undefined;
}
