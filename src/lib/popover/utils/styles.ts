import type { CSSProperties } from 'react';

interface GetPopoverStylesParams {
  finalLayoutPos: { top: number; left: number };
  offset?: { x: number; y: number };
  dragX?: number;
  dragY?: number;
  rotation?: number;
  zIndex?: number;
}

/**
 * Utility to compile absolute layout coordinates, drag-and-drop translations,
 * and rotation angles into a single React CSSProperties style object.
 */
export function getPopoverStyles({
  finalLayoutPos,
  offset = { x: 0, y: 0 },
  dragX = 0,
  dragY = 0,
  rotation = 0,
  zIndex = 1000,
}: GetPopoverStylesParams): CSSProperties {
  const translateX = Math.round(dragX + offset.x);
  const translateY = Math.round(dragY + offset.y);

  return {
    position: 'absolute',
    top: Math.round(finalLayoutPos.top),
    left: Math.round(finalLayoutPos.left),
    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
    willChange: 'transform',
    zIndex,
  };
}
