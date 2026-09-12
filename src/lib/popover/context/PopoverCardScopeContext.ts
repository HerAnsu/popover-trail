/**
 * Shared Context Scope for PopoverCard compound components.
 * Clean Architecture Layer 3: Reactive Integration & Context.
 *
 * @module context/PopoverCardScopeContext
 */

import { createContext, useContext, type RefObject } from 'react';
import type { TrailEntry } from '../types';
import type { UsePopoverCardResult } from '../hooks/usePopoverCard';
import type { usePopoverActions } from './usePopoverStore';
import { validateCardSubComponentScope } from '../validators';
import { isCardStaticScope, isPopoverCardScope } from './cardScopeGuards';

export interface CardStaticScope<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  readonly entryKey: TPopoverKey;
  readonly entry: TrailEntry<TData, TPopoverKey>;
  readonly index: number;
  readonly actions: ReturnType<typeof usePopoverActions<TData, TContext, TPopoverKey>>;
  readonly cardRef?: RefObject<HTMLElement | null>;
}

export interface CardDynamicScope {
  readonly isPinned: boolean;
  readonly card: UsePopoverCardResult;
}

export interface PopoverCardScope<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  entry: TrailEntry<TData, TPopoverKey>;
  index: number;
  isPinned: boolean;
  card: UsePopoverCardResult;
  actions: ReturnType<typeof usePopoverActions<TData, TContext, TPopoverKey>>;
  cardRef?: RefObject<HTMLElement | null>;
}

export const PopoverCardScopeContext = createContext<PopoverCardScope<unknown> | null>(null);
PopoverCardScopeContext.displayName = 'PopoverCardScopeContext';

export const PopoverCardStaticContext = createContext<CardStaticScope<unknown> | null>(null);
PopoverCardStaticContext.displayName = 'PopoverCardStaticContext';

function assertCardScope<TData, TContext = unknown, TPopoverKey extends string = string>(
  ctx: unknown,
): asserts ctx is PopoverCardScope<TData, TContext, TPopoverKey> {
  validateCardSubComponentScope(isPopoverCardScope(ctx), 'SubComponent');
  if (!isPopoverCardScope<TData, TContext, TPopoverKey>(ctx)) {
    throw new Error('<PopoverCard> sub-components must be rendered within a <PopoverCard>');
  }
}

export function usePopoverCardScope<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(): PopoverCardScope<TData, TContext, TPopoverKey> {
  const ctx = useContext(PopoverCardScopeContext);
  assertCardScope<TData, TContext, TPopoverKey>(ctx);
  return ctx;
}

export function usePopoverCardStatic<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(): CardStaticScope<TData, TContext, TPopoverKey> {
  const staticCtx = useContext(PopoverCardStaticContext);
  const fullCtx = useContext(PopoverCardScopeContext);
  if (isCardStaticScope<TData, TContext, TPopoverKey>(staticCtx)) {
    return staticCtx;
  }
  assertCardScope<TData, TContext, TPopoverKey>(fullCtx);
  return {
    entryKey: fullCtx.entry.key,
    entry: fullCtx.entry,
    index: fullCtx.index,
    actions: fullCtx.actions,
    cardRef: fullCtx.cardRef,
  };
}
