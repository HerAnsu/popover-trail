/**
 * Popover Card Types and Props Declarations.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/card/types
 */

import type { ReactNode, ElementType } from 'react';
import type { PolymorphicPropsWithRef, TrailEntry, PopoverPlacement } from '../../types';
import type { PopoverCardScope } from './PopoverCardScopeContext';

export interface PopoverCardBaseProps<TData = unknown> {
  entry: TrailEntry<TData>;
  index: number;
  isPinned: boolean;
  placement?: PopoverPlacement;
  children?: ReactNode | ((scope: PopoverCardScope<TData>) => ReactNode);
}

export type PopoverCardProps<
  E extends ElementType = 'div',
  TData = unknown,
> = PolymorphicPropsWithRef<E, PopoverCardBaseProps<TData>>;
