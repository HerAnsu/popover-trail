/**
 * Base Properties and Transition Status for Popover Trail Entries.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/entry/entryBase
 */

import type { PopoverDisplayOptions } from '../config/optionsConfig';
import type { PopoverRect } from '../geometry';

export const POPOVER_TRANSITION_STATUSES = ['mounting', 'mounted', 'unmounting'] as const;

export type PopoverTransitionStatus = (typeof POPOVER_TRANSITION_STATUSES)[number];

export interface TrailEntryBase<
  TPopoverKey extends string = string,
  TData = unknown,
> extends PopoverDisplayOptions {
  key: TPopoverKey;
  parentKey?: TPopoverKey;
  parentKeys?: ReadonlySet<TPopoverKey> | readonly TPopoverKey[];
  rect?: DOMRect | PopoverRect;
  pinnedLayoutPos?: {
    top: number;
    left: number;
  };
  originalParentKey?: TPopoverKey;
  originalRect?: DOMRect | PopoverRect;
  transitionStatus?: PopoverTransitionStatus;
  dataPromise?: Promise<TData>;
}
