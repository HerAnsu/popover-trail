import React, { type ReactNode, type ElementType, type KeyboardEvent } from 'react';
import { clsx } from '../../utils/clsx';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverTimelineScope } from './PopoverTimelineScopeContext';
import type { PopoverTimelineItem, UsePopoverTimelineResult } from '../../hooks/usePopoverTimeline';
import { getPolymorphicProps } from '../../utils/componentUtils';

/**
 * Context object passed to StepList render-prop callbacks.
 */
export interface PopoverTimelineStepListContext<TData = unknown> {
  history: PopoverTimelineItem<TData>[];
  currentIndex: number;
  timeline: UsePopoverTimelineResult<TData>;
}

export type PopoverTimelineStepListRenderProp<TData = unknown> =
  | ((context: PopoverTimelineStepListContext<TData>) => ReactNode)
  | ((item: PopoverTimelineItem<TData>, active: boolean, index: number) => ReactNode);

export type PopoverTimelineStepListChildren<TData = unknown> =
  | ReactNode
  | PopoverTimelineStepListRenderProp<TData>;

/**
 * Subcomponent for the timeline step list container.
 */
export type PopoverTimelineStepListProps<
  E extends ElementType = 'ol',
  TData = unknown,
> = PolymorphicProps<
  E,
  {
    children: PopoverTimelineStepListChildren<TData>;
  }
>;

function invokeStepListRenderProp<TData>(
  fn: PopoverTimelineStepListRenderProp<TData>,
  timeline: UsePopoverTimelineResult<TData>,
): ReactNode {
  if (fn.length <= 1) {
    const contextFn = fn as (context: PopoverTimelineStepListContext<TData>) => ReactNode;
    const result = contextFn({
      history: timeline.history,
      currentIndex: timeline.currentIndex,
      timeline,
    });
    if (result !== undefined) {
      return result;
    }
  }

  const itemFn = fn as (
    item: PopoverTimelineItem<TData>,
    active: boolean,
    index: number,
  ) => ReactNode;
  return timeline.history.map((item, idx) => itemFn(item, idx === timeline.currentIndex, idx));
}

/**
 * Subcomponent for the timeline step list container (`<ol role="list">`).
 * Supports both standard React children and render-prop patterns.
 *
 * @template E - Underlying HTML element or component type (defaults to `'ol'`).
 * @param props - Polymorphic list props and children.
 * @returns Ordered list element wrapping timeline steps.
 */
export function PopoverTimelineStepList<E extends ElementType = 'ol', TData = unknown>({
  as,
  children,
  className,
  ...restProps
}: PopoverTimelineStepListProps<E, TData>) {
  const Component = as ?? 'ol';
  const { timeline } = usePopoverTimelineScope<TData>();
  const mergedClassName = clsx('pt-timeline-step-list', className);

  const renderedContent: ReactNode =
    typeof children === 'function' ? invokeStepListRenderProp(children, timeline) : children;

  return (
    <Component className={mergedClassName} role="list" {...restProps}>
      {renderedContent}
    </Component>
  );
}

/**
 * Base props for an individual step item in the timeline.
 */
export interface PopoverTimelineStepBaseProps {
  /** 0-based virtual step index. */
  index?: number;
  /** Alias for index. */
  stepIndex?: number;
  /** Key of the primary popover entry at this step. */
  stepKey?: string;
  /** Active status override. */
  active?: boolean;
  /** Optional title or label for the step. */
  label?: string;
  /** Children elements or fallback label. */
  children?: ReactNode;
}

export type PopoverTimelineStepProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  PopoverTimelineStepBaseProps
>;

/**
 * Subcomponent representing an individual step in the timeline.
 *
 * @remarks
 * Clicking jumps directly to that step. Supports Left/Right arrow key navigation.
 *
 * @template E - Underlying HTML element or component type (defaults to `'button'`).
 * @param props - Step properties including index, stepKey, label, and click handlers.
 * @returns Interactive step button or element.
 */
export function PopoverTimelineStep<E extends ElementType = 'button'>({
  as,
  index,
  stepIndex,
  stepKey,
  active,
  label,
  children,
  className,
  onClick,
  onKeyDown,
  ...restProps
}: PopoverTimelineStepProps<E>) {
  const { Component, buttonProps } = getPolymorphicProps(as);
  const { timeline } = usePopoverTimelineScope();

  const effectiveIndex = index ?? stepIndex ?? 0;
  const isCurrent = active ?? timeline.currentIndex === effectiveIndex;
  const effectiveKey = stepKey ?? label ?? `step-${effectiveIndex}`;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    timeline.jumpToStep(effectiveIndex);
    if (typeof onClick === 'function') {
      onClick(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft' && timeline.canUndo) {
      e.preventDefault();
      timeline.jumpToStep(Math.max(0, effectiveIndex - 1));
    } else if (e.key === 'ArrowRight' && timeline.canRedo) {
      e.preventDefault();
      timeline.jumpToStep(Math.min(timeline.history.length - 1, effectiveIndex + 1));
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
      {...buttonProps}
      className={mergedClassName}
      data-index={effectiveIndex}
      data-key={effectiveKey}
      data-current={isCurrent ? 'true' : 'false'}
      aria-current={isCurrent ? 'step' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...restProps}>
      {children ?? label ?? effectiveKey}
    </Component>
  );
}
