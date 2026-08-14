/**
 * Shared Context Scope for PopoverCard compound components.
 *
 * @module components/card/PopoverCardScopeContext
 */

import { createContext, useContext } from 'react';
import type { TrailEntry } from '../../types';
import type { UsePopoverCardResult } from '../../hooks/usePopoverCard';
import type { usePopoverActions } from '../../context';
import { validateCardSubComponentScope } from '../../utils/devWarnings';

/**
 * Inner state scope passed to `<PopoverCard>` compound sub-components.
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
  /** Bound store actions dispatcher. */
  actions: ReturnType<typeof usePopoverActions>;
}

export const PopoverCardScopeContext = createContext<PopoverCardScope | null>(null);
PopoverCardScopeContext.displayName = 'PopoverCardScopeContext';

/**
 * Hook providing access to the current `<PopoverCard>` scope context.
 *
 * @remarks
 * Throws an error if invoked outside the boundary of a `<PopoverCard>`.
 *
 * @returns The active card scope object.
 */
export function usePopoverCardScope() {
  const ctx = useContext(PopoverCardScopeContext);
  validateCardSubComponentScope(Boolean(ctx), 'SubComponent');
  if (!ctx) {
    throw new Error('<PopoverCard> sub-components must be rendered within a <PopoverCard>');
  }
  return ctx;
}
