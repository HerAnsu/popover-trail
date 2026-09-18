/**
 * Action Signatures for Pinning, Offsets, and Stacking Order Slices.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/actions/pinningActions
 */

import type { DragOffset, PopoverRect } from '../geometry';

export interface PinningSliceActions<
  _TData = unknown,
  _TContext = unknown,
  TPopoverKey extends string = string,
> {
  togglePin: (key: TPopoverKey, rect?: DOMRect | PopoverRect) => void;
  bringToFront: (key: TPopoverKey) => void;
  updateOffset: (
    key: TPopoverKey,
    xOrOffset: number | DragOffset | ((prev: DragOffset) => DragOffset),
    maybeY?: number,
  ) => void;
  setOffsets?: (
    offsetsOrUpdater:
      | Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>
      | ((
          prev: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>,
        ) => Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>),
  ) => void;
}
