/**
 * Card Keyboard Navigation Dispatcher for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/useCardKeyboardNav
 */

import type { TrailEntry } from '../../types';
import { isRecordObject } from '../../utils/typeGuards';
import { EMPTY_ARRAY } from '../../constants';
import {
  type KeyboardNavEvent,
  handleCustomShortcuts,
  handleVerticalArrows,
  handleHorizontalArrows,
} from './cardKeyboardStrategies';

export { focusParentCard, getFocusableCardElements } from './cardKeyboardFocus';
export type { KeyboardNavEvent } from './cardKeyboardStrategies';

/**
 * Options contract for dispatching card keyboard navigation events.
 */
export interface CardKeyboardNavOptions<
  TData = unknown,
  TPopoverKey extends string = string,
> {
  /** Keyboard event to handle. */
  event: KeyboardNavEvent;
  /** Card DOM container element. */
  cardElement: HTMLElement | null;
  /** Active popover trail entry. */
  entry: TrailEntry<TData, TPopoverKey>;
  /** Whether arrow key navigation is globally enabled. */
  enableArrowNavigation: boolean;
  /** Whether the card is pinned. */
  isPinned: boolean;
  /** Complete list of trail entries. */
  trail: readonly TrailEntry<TData, TPopoverKey>[];
  /** Count of active floating cards. */
  floatingCount: number;
  /** Actions available to close or dismiss cards. */
  actions: {
    closeFrom: (index: number, options?: { transition?: boolean }) => void;
    closeByKey?: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  };
}

function isCardKeyboardNavOptions<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is CardKeyboardNavOptions<TData, TPopoverKey> {
  return isRecordObject(val) && 'event' in val && isRecordObject(val.event);
}

function resolveNavParams<TData = unknown, TPopoverKey extends string = string>(
  eventOrOptions: KeyboardNavEvent | CardKeyboardNavOptions<TData, TPopoverKey>,
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
    const {
      event: e,
      cardElement: cardEl,
      entry: cardEntry,
      enableArrowNavigation: enableArrow,
      isPinned: pinned,
      trail: trailList = EMPTY_ARRAY,
      actions: act,
    } = eventOrOptions;
    return {
      e,
      cardEl,
      cardEntry,
      enableArrow,
      pinned,
      trailList,
      act,
    };
  }
  return {
    e: eventOrOptions,
    cardEl: cardElement,
    cardEntry: entry,
    enableArrow: Boolean(enableArrowNavigation),
    pinned: Boolean(isPinned),
    trailList: trail ?? EMPTY_ARRAY,
    act: actions,
  };
}

/**
 * Dispatches keyboard navigation events for popover cards.
 * Evaluates custom shortcuts first, followed by vertical and horizontal arrow navigation.
 *
 * @template TData - Stored entry data type.
 * @template TPopoverKey - Branded key type.
 * @param eventOrOptions - Either a full `CardKeyboardNavOptions` bundle or an individual `KeyboardNavEvent`.
 * @param cardElement - Card root HTMLElement when using positional parameters.
 * @param entry - Trail entry when using positional parameters.
 * @param enableArrowNavigation - Boolean toggle for arrow navigation.
 * @param isPinned - Pinned state boolean.
 * @param trail - List of active trail entries.
 * @param _floatingCount - Count of floating entries.
 * @param actions - Object with `closeFrom` and `closeByKey` dispatchers.
 *
 * @example
 * ```typescript
 * handleCardKeyboard({
 *   event: e,
 *   cardElement,
 *   entry,
 *   enableArrowNavigation: true,
 *   isPinned: false,
 *   trail,
 *   floatingCount: 1,
 *   actions,
 * });
 * ```
 */
export function handleCardKeyboard<TData = unknown, TPopoverKey extends string = string>(
  eventOrOptions: KeyboardNavEvent | CardKeyboardNavOptions<TData, TPopoverKey>,
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
  const { e, cardEl, cardEntry, enableArrow, pinned, trailList, act } =
    resolveNavParams<TData, TPopoverKey>(
      eventOrOptions,
      cardElement,
      entry,
      enableArrowNavigation,
      isPinned,
      trail,
      actions,
    );
  if (!e || !cardEntry) return;
  if (handleCustomShortcuts(e, cardEntry)) return;
  if (!enableArrow) return;
  handleVerticalArrows(e, cardEl ?? null);
  handleHorizontalArrows(e, cardEntry, pinned, trailList, act);
}
