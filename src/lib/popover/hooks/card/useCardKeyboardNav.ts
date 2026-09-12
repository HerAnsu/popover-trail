/**
 * Card Keyboard Navigation Dispatcher for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/useCardKeyboardNav
 */

import type { TrailEntry } from '../../types';
import { isRecordObject } from '../../utils/typeGuards';
import {
  type KeyboardNavEvent,
  handleCustomShortcuts,
  handleVerticalArrowNavigation,
  handleHorizontalArrowNavigation,
} from './cardKeyboardStrategies';

export { focusParentCard, getFocusableCardElements } from './cardKeyboardFocus';
export type { KeyboardNavEvent } from './cardKeyboardStrategies';

export interface CardKeyboardNavigationOptions<
  TData = unknown,
  TPopoverKey extends string = string,
> {
  event: KeyboardNavEvent;
  cardElement: HTMLElement | null;
  entry: TrailEntry<TData, TPopoverKey>;
  enableArrowNavigation: boolean;
  isPinned: boolean;
  trail: readonly TrailEntry<TData, TPopoverKey>[];
  floatingCount: number;
  actions: {
    closeFrom: (index: number, options?: { transition?: boolean }) => void;
    closeByKey?: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  };
}

function isCardKeyboardNavOptions<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is CardKeyboardNavigationOptions<TData, TPopoverKey> {
  return isRecordObject(val) && 'event' in val && isRecordObject(val.event);
}

function resolveNavParams<TData = unknown, TPopoverKey extends string = string>(
  eventOrOptions: KeyboardNavEvent | CardKeyboardNavigationOptions<TData, TPopoverKey>,
  cardElement?: HTMLElement | null,
  entry?: TrailEntry<TData, TPopoverKey>,
  enableArrowNavigation?: boolean,
  isPinned?: boolean,
  trail?: readonly TrailEntry<TData, TPopoverKey>[],
  actions?: {
    closeFrom: (index: number, options?: { transition?: boolean }) => void;
    closeByKey?: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  },
) {
  if (isCardKeyboardNavOptions<TData, TPopoverKey>(eventOrOptions)) {
    const o = eventOrOptions;
    return {
      e: o.event,
      cardEl: o.cardElement,
      cardEntry: o.entry,
      enableArrow: o.enableArrowNavigation,
      pinned: o.isPinned,
      trailList: o.trail ?? [],
      act: o.actions,
    };
  }
  return {
    e: eventOrOptions,
    cardEl: cardElement,
    cardEntry: entry,
    enableArrow: Boolean(enableArrowNavigation),
    pinned: Boolean(isPinned),
    trailList: trail ?? [],
    act: actions,
  };
}

export function handleCardKeyboardNavigation<TData = unknown, TPopoverKey extends string = string>(
  eventOrOptions: KeyboardNavEvent | CardKeyboardNavigationOptions<TData, TPopoverKey>,
  cardElement?: HTMLElement | null,
  entry?: TrailEntry<TData, TPopoverKey>,
  enableArrowNavigation?: boolean,
  isPinned?: boolean,
  trail?: readonly TrailEntry<TData, TPopoverKey>[],
  _floatingCount?: number,
  actions?: {
    closeFrom: (index: number, options?: { transition?: boolean }) => void;
    closeByKey?: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  },
): void {
  const p = resolveNavParams<TData, TPopoverKey>(
    eventOrOptions,
    cardElement,
    entry,
    enableArrowNavigation,
    isPinned,
    trail,
    actions,
  );
  if (!p.e || !p.cardEntry) return;
  if (handleCustomShortcuts(p.e, p.cardEntry)) return;
  if (!p.enableArrow) return;
  handleVerticalArrowNavigation(p.e, p.cardEl ?? null);
  handleHorizontalArrowNavigation(p.e, p.cardEntry, p.pinned, p.trailList, p.act);
}
