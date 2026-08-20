/**
 * Shared Context Scope for PopoverCard compound components.
 *
 * @module components/card/PopoverCardScopeContext
 */

import { createContext, useContext, type RefObject } from 'react';
import type { TrailEntry } from '../../types';
import type { UsePopoverCardResult } from '../../hooks/usePopoverCard';
import type { usePopoverActions } from '../../context';
import { validateCardSubComponentScope } from '../../validators';

/**
 * Inner state scope passed to `<PopoverCard>` compound subcomponents.
 *
 * @template TData - Resolved data payload type.
 */
export interface PopoverCardScope<TData = unknown> {
  /** The active TrailEntry representing this card. */
  entry: TrailEntry<TData>;
  /** 0-based virtual index in the combined trail stack. */
  index: number;
  /** Whether the card is detached/pinned into a floating window. */
  isPinned: boolean;
  /** Positioning, styling, and drag handle props from usePopoverCard. */
  card: UsePopoverCardResult;
  /** Bound store actions' dispatcher. */
  actions: ReturnType<typeof usePopoverActions>;
  /** Direct DOM ref to the root card container element. */
  cardRef?: RefObject<HTMLElement | null>;
}

export const PopoverCardScopeContext = createContext<PopoverCardScope<unknown> | null>(null);
PopoverCardScopeContext.displayName = 'PopoverCardScopeContext';

function assertCardScope<TData>(ctx: unknown): asserts ctx is PopoverCardScope<TData> {
  validateCardSubComponentScope(Boolean(ctx), 'SubComponent');
  if (!ctx) {
    throw new Error('<PopoverCard> sub-components must be rendered within a <PopoverCard>');
  }
}

/**
 * Hook providing access to the current `<PopoverCard>` scope context.
 *
 * @remarks
 * Throws an error if invoked outside the boundary of a `<PopoverCard>`.
 *
 * @returns The active card scope object.
 */
export function usePopoverCardScope<TData = unknown>(): PopoverCardScope<TData> {
  const ctx = useContext(PopoverCardScopeContext);
  assertCardScope<TData>(ctx);
  return ctx;
}
