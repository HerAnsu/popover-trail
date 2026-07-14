import type { CSSProperties } from "react";

/**
 * Parameters for the popover style generation helper.
 */
interface GetPopoverStylesParams {
  /** Viewport relative absolute base layout position returned by Floating UI. */
  finalLayoutPos: { top: number; left: number };
  /** Retained cumulative coordinate drag offset stored inside the Zustand state. */
  offset?: { x: number; y: number };
  /** Temporary, immediate drag translation coordinates from active drag actions. */
  dragX?: number;
  /** Temporary, immediate drag translation coordinates from active drag actions. */
  dragY?: number;
  /** Physics-based spring rotation angle in degrees. */
  rotation?: number;
  /** Layer depth index to stack topmost/pinned items. */
  zIndex?: number;
}

/**
 * Computes the absolute layout coordinates, drag-and-drop translations,
 * and rotation physics angles into a single React CSSProperties style object.
 *
 * @remarks
 * Coordinates are rounded to the nearest pixel (`Math.round`) to prevent sub-pixel
 * fractional layout coordinates from rendering blurry borders and blurry text.
 * Promotes the element to its own compositor layer using `willChange: "transform"`
 * to ensure hardware-accelerated transformations during fast dragging operations.
 *
 * @param params - The coordinates, offsets, and transformation properties.
 * @returns A CSS properties style object ready to be applied on the outer card element.
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
    position: "absolute",
    top: Math.round(finalLayoutPos.top),
    left: Math.round(finalLayoutPos.left),
    transform: `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
    willChange: "transform",
    zIndex,
  };
}
