import React, { type ReactNode, type ElementType, type KeyboardEvent } from 'react';
import { clsx } from '../../utils/clsx';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverTimelineScope } from './PopoverTimelineScopeContext';

/**
 * Sub-component for the timeline step list container.
 */
export type PopoverTimelineStepListProps<E extends ElementType = 'ol'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverTimelineStepList<E extends ElementType = 'ol'>({
  as,
  children,
  className,
  ...restProps
}: PopoverTimelineStepListProps<E>) {
  const Component = as || 'ol';
  const mergedClassName = clsx('pt-timeline-step-list', className);

  return (
    <Component className={mergedClassName} role="list" {...restProps}>
      {children}
    </Component>
  );
}

/**
 * Sub-component for an individual step item in the timeline.
 */
export interface PopoverTimelineStepBaseProps {
  /** Virtual step index. */
  index: number;
  /** Key of the primary popover entry at this step. */
  stepKey: string;
  /** Optional title or label for the step. */
  label?: string;
  /** Children elements or fallback label. */
  children?: ReactNode;
}

export type PopoverTimelineStepProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  PopoverTimelineStepBaseProps
>;

export function PopoverTimelineStep<E extends ElementType = 'button'>({
  as,
  index,
  stepKey,
  label,
  children,
  className,
  onClick,
  onKeyDown,
  ...restProps
}: PopoverTimelineStepProps<E>) {
  const Component = as || 'button';
  const { timeline } = usePopoverTimelineScope();

  const isCurrent = timeline.currentIndex === index;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    timeline.jumpToStep(index);
    if (typeof onClick === 'function') {
      onClick(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft' && timeline.canUndo) {
      e.preventDefault();
      timeline.jumpToStep(Math.max(0, index - 1));
    } else if (e.key === 'ArrowRight' && timeline.canRedo) {
      e.preventDefault();
      timeline.jumpToStep(Math.min(timeline.history.length - 1, index + 1));
    }
    if (typeof onKeyDown === 'function') {
      onKeyDown(e);
    }
  };

  const mergedClassName = clsx('pt-timeline-step', className, {
    'pt-timeline-step-current': isCurrent,
  });

  return (
    <Component
      className={mergedClassName}
      data-index={index}
      data-key={stepKey}
      data-current={isCurrent ? 'true' : 'false'}
      aria-current={isCurrent ? 'step' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...restProps}>
      {children ?? label ?? stepKey}
    </Component>
  );
}
