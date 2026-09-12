/**
 * Timeline Step List Container Component.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/timeline/PopoverTimelineStepList
 */

import { type ReactNode, type ElementType } from 'react';
import { clsx } from '../../utils/clsx';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverTimelineScope } from './PopoverTimelineScopeContext';
import type { PopoverTimelineItem, UsePopoverTimelineResult } from '../../hooks/usePopoverTimeline';

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

export type PopoverTimelineStepListProps<
  E extends ElementType = 'ol',
  TData = unknown,
> = PolymorphicProps<
  E,
  {
    children: PopoverTimelineStepListChildren<TData>;
  }
>;

function isContextRenderProp<TData>(
  fn: PopoverTimelineStepListRenderProp<TData>,
): fn is (context: PopoverTimelineStepListContext<TData>) => ReactNode {
  return fn.length <= 1;
}

function renderTimelineStepListChildren<TData>(
  children: PopoverTimelineStepListChildren<TData>,
  timeline: UsePopoverTimelineResult<TData>,
): ReactNode {
  if (typeof children !== 'function') return children;
  if (isContextRenderProp(children)) {
    return children({
      history: timeline.history,
      currentIndex: timeline.currentIndex,
      timeline,
    });
  }
  return timeline.history.map((item, idx) => children(item, idx === timeline.currentIndex, idx));
}

export function PopoverTimelineStepList<E extends ElementType = 'ol', TData = unknown>({
  as,
  children,
  className,
  ...restProps
}: PopoverTimelineStepListProps<E, TData>) {
  const Component = as ?? 'ol';
  const { timeline } = usePopoverTimelineScope<TData>();
  const renderedContent = renderTimelineStepListChildren(children, timeline);

  return (
    <Component
      className={clsx('pt-timeline-step-list', className)}
      role="list"
      aria-live="polite"
      {...restProps}>
      {renderedContent}
    </Component>
  );
}
