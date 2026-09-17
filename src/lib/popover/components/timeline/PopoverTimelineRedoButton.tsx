/**
 * Accessible Redo Action Button Subcomponent for Timeline.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/timeline/PopoverTimelineRedoButton
 */

import React, { type ReactNode, type ElementType } from 'react';
import { clsx } from '../../utils/clsx';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverTimelineScope } from './PopoverTimelineScopeContext';
import { resolvePolymorphicProps } from '../../utils/componentUtils';

export type PopoverTimelineRedoButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverTimelineRedoButton<E extends ElementType = 'button'>({
  as,
  children,
  className,
  onClick,
  disabled,
  ...restProps
}: PopoverTimelineRedoButtonProps<E>) {
  const { Component, buttonProps } = resolvePolymorphicProps(as);
  const { timeline } = usePopoverTimelineScope();

  const isDisabled = disabled ?? !timeline.canRedo;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    timeline.redo();
    onClick?.(e);
  };

  return (
    <Component
      {...buttonProps}
      className={clsx('pt-timeline-redo-btn', className)}
      disabled={isDisabled}
      aria-label="Redo Popover Action"
      onClick={handleClick}
      {...restProps}>
      {children ?? 'Redo'}
    </Component>
  );
}
