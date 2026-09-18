/**
 * Accessible Undo Action Button Subcomponent for Timeline.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/timeline/PopoverTimelineUndoButton
 */

import React, { type ReactNode, type ElementType } from 'react';
import { clsx } from '../../utils/clsx';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverTimelineScope } from './PopoverTimelineScopeContext';
import { resolvePolymorphicProps } from '../../utils/componentUtils';

export type PopoverTimelineUndoButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverTimelineUndoButton<E extends ElementType = 'button'>({
  as,
  children,
  className,
  onClick,
  disabled,
  ...restProps
}: PopoverTimelineUndoButtonProps<E>) {
  const { Component, buttonProps } = resolvePolymorphicProps(as);
  const { timeline } = usePopoverTimelineScope();
  const { canUndo, undo } = timeline;

  const isDisabled = disabled ?? !canUndo;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    undo();
    onClick?.(e);
  };

  return (
    <Component
      {...buttonProps}
      className={clsx('pt-timeline-undo-btn', className)}
      disabled={isDisabled}
      aria-label="Undo Popover Action"
      onClick={handleClick}
      {...restProps}>
      {children ?? 'Undo'}
    </Component>
  );
}
