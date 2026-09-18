/**
 * Visual History Timeline & Navigation Component for popover-trail.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * Provides accessible timeline navigation across the state history journal,
 * allowing users to step backward, forward, and inspect previous cascade states.
 *
 * Compound subcomponents:
 * - `PopoverTimeline.StepList`: Ordered list of historical steps.
 * - `PopoverTimeline.Step`: Individual step item showing key and active state.
 * - `PopoverTimeline.UndoButton`: Steps backward to the previous state.
 * - `PopoverTimeline.RedoButton`: Steps forward to the next state.
 *
 * @example
 * ```tsx
 * <PopoverTimeline>
 *   <PopoverTimeline.UndoButton>Undo</PopoverTimeline.UndoButton>
 *   <PopoverTimeline.StepList />
 *   <PopoverTimeline.RedoButton>Redo</PopoverTimeline.RedoButton>
 * </PopoverTimeline>
 * ```
 *
 * @module PopoverTimeline
 */

import { useMemo, type ReactNode, type ElementType } from 'react';
import { clsx } from '../utils/clsx';
import { usePopoverTimeline } from '../hooks/usePopoverTimeline';
import type { PolymorphicProps } from './PopoverCard';
import {
  PopoverTimelineScopeContext,
  type PopoverTimelineScope,
} from './timeline/PopoverTimelineScopeContext';
import {
  PopoverTimelineStepList,
  PopoverTimelineStep,
  type PopoverTimelineStepListProps,
  type PopoverTimelineStepBaseProps,
  type PopoverTimelineStepProps,
} from './timeline/PopoverTimelineSteps';
import {
  PopoverTimelineUndoButton,
  PopoverTimelineRedoButton,
  type PopoverTimelineUndoButtonProps,
  type PopoverTimelineRedoButtonProps,
} from './timeline/PopoverTimelineButtons';

export type {
  PopoverTimelineStepListProps,
  PopoverTimelineStepBaseProps,
  PopoverTimelineStepProps,
  PopoverTimelineUndoButtonProps,
  PopoverTimelineRedoButtonProps,
};

export interface PopoverTimelineBaseProps {
  /** Optional custom CSS class name. */
  className?: string;
  /** React children or render prop receiving timeline scope. */
  children?: ReactNode | ((scope: PopoverTimelineScope) => ReactNode);
}

export type PopoverTimelineProps<E extends ElementType = 'nav'> = PolymorphicProps<
  E,
  PopoverTimelineBaseProps
>;

export function PopoverTimeline<E extends ElementType = 'nav'>({
  as,
  children,
  className,
  ...restProps
}: PopoverTimelineProps<E>) {
  const Component = as || 'nav';
  const timeline = usePopoverTimeline();
  const scope = useMemo<PopoverTimelineScope>(() => ({ timeline }), [timeline]);

  return (
    <PopoverTimelineScopeContext value={scope}>
      <Component
        className={clsx('pt-timeline', className)}
        aria-label="Popover Trail Timeline"
        {...restProps}>
        {typeof children === 'function' ? children(scope) : children}
      </Component>
    </PopoverTimelineScopeContext>
  );
}

PopoverTimeline.StepList = PopoverTimelineStepList;
PopoverTimeline.Step = PopoverTimelineStep;
PopoverTimeline.UndoButton = PopoverTimelineUndoButton;
PopoverTimeline.RedoButton = PopoverTimelineRedoButton;
