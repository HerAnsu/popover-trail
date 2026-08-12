/**
 * Visual History Timeline & Navigation Component for popover-trail.
 * Provides interactive breadcrumbs, step-by-step jump navigation, undo, and redo.
 *
 * @module PopoverTimeline
 */

import { useMemo, type ReactNode, type ElementType } from 'react';
import { clsx } from '../utils/storeHelpers';
import { usePopoverTimeline } from '../context';
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
  /** Children elements or render prop function. */
  children?: ReactNode | ((scope: PopoverTimelineScope) => ReactNode);
}

export type PopoverTimelineProps<E extends ElementType = 'nav'> = PolymorphicProps<
  E,
  PopoverTimelineBaseProps
>;

/**
 * Root `<PopoverTimeline>` Headless Component.
 * Renders an interactive visual breadcrumb / history timeline for popover trail navigation.
 */
export function PopoverTimeline<E extends ElementType = 'nav'>({
  as,
  children,
  className,
  ...restProps
}: PopoverTimelineProps<E>) {
  const Component = as || 'nav';
  const timeline = usePopoverTimeline();

  const scope = useMemo<PopoverTimelineScope>(() => ({ timeline }), [timeline]);

  const mergedClassName = clsx('pt-timeline', className);

  return (
    <PopoverTimelineScopeContext value={scope}>
      <Component className={mergedClassName} aria-label="Popover Trail Timeline" {...restProps}>
        {typeof children === 'function' ? children(scope) : children}
      </Component>
    </PopoverTimelineScopeContext>
  );
}

PopoverTimeline.StepList = PopoverTimelineStepList;
PopoverTimeline.Step = PopoverTimelineStep;
PopoverTimeline.UndoButton = PopoverTimelineUndoButton;
PopoverTimeline.RedoButton = PopoverTimelineRedoButton;
