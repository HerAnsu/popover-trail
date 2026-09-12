/**
 * Popover Card Hook Types Declarations.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/cardTypes
 */

import type { CSSProperties, HTMLAttributes, KeyboardEvent } from 'react';
import type { TrailEntry, PopoverPlacement } from '../../types';
import type { usePopoverActions } from '../../context/usePopoverStore';

export interface UsePopoverCardOptions<TData = unknown, TPopoverKey extends string = string> {
  entry: TrailEntry<TData, TPopoverKey>;
  index: number;
  isPinned: boolean;
  placement?: PopoverPlacement;
}

export interface UsePopoverCardResult<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  readonly ref: (node: HTMLElement | null) => void;
  readonly style: Readonly<CSSProperties>;
  readonly isTop: boolean;
  readonly isDragging: boolean;
  readonly actions: ReturnType<typeof usePopoverActions<TData, TContext, TPopoverKey>>;
  readonly dragHandleProps: HTMLAttributes<HTMLElement>;
  readonly onMouseEnter: () => void;
  readonly onMouseLeave: () => void;
  readonly onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  readonly transitionClassName: string;
  readonly buttonControls: Readonly<{
    enablePin: boolean;
    enableClose: boolean;
    enableDrag: boolean;
    customButtons: ReadonlyArray<{
      id: string;
      label: string;
      icon?: string;
      disabled?: boolean;
      onClick?: (key: string) => void;
    }>;
  }>;
  readonly handlePinToggle: () => void;
}
