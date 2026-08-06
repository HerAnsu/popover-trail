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

export interface PopoverCardScope<TData = unknown> {
  entry: TrailEntry<TData>;
  index: number;
  isPinned: boolean;
  card: UsePopoverCardResult;
  actions: ReturnType<typeof usePopoverActions>;
}

export const PopoverCardScopeContext = createContext<PopoverCardScope | null>(null);
PopoverCardScopeContext.displayName = 'PopoverCardScopeContext';

export function usePopoverCardScope() {
  const ctx = useContext(PopoverCardScopeContext);
  validateCardSubComponentScope(Boolean(ctx), 'SubComponent');
  if (!ctx) {
    throw new Error('<PopoverCard> sub-components must be rendered within a <PopoverCard>');
  }
  return ctx;
}
