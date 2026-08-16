import React, { type ReactNode, type ElementType, type KeyboardEvent } from 'react';
import { clsx } from '../../utils/clsx';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverTimelineScope } from './PopoverTimelineScopeContext';
import type { PopoverTimelineItem, UsePopoverTimelineResult } from '../../hooks/usePopoverTimeline';

/**
 * Context object passed to StepList render-prop callbacks.
 */
export interface PopoverTimelineStepListContext<TData = unknown> {
  history: PopoverTimelineItem<TData>[];
  currentIndex: number;
  timeline: UsePopoverTimelineResult<TData>;
}

export type PopoverTimelineStepListChildren<TData = unknown> =
  | ReactNode
  | ((context: PopoverTimelineStepListContext<TData>) => ReactNode)
  | ((item: PopoverTimelineItem<TData>, active: boolean, index: number) => ReactNode);

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
  const { timeline } = usePopoverTimelineScope();
  const mergedClassName = clsx('pt-timeline-step-list', className);

  let renderedContent: ReactNode = null;

  if (typeof children === 'function') {
    const fn = children as Function;
    // Check if render-prop expects context object ({ history, ... }) or per-item callback (item, active)
    if (fn.length <= 1) {
      const result = fn({
        history: timeline.history,
        currentIndex: timeline.currentIndex,
        timeline,
      });

      // If function returned undefined (was expecting item), fallback to item map
      renderedContent =
        result !== undefined
          ? result
          : timeline.history.map((item, idx) => fn(item, idx === timeline.currentIndex, idx));
    } else {
      renderedContent = timeline.history.map((item, idx) =>
        fn(item, idx === timeline.currentIndex, idx),
      );
    }
  } else {
    renderedContent = children;
  }

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
  const Component = as ?? 'button';
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
