/**
 * Visual History Timeline & Navigation Component for popover-trail.
 * Provides interactive breadcrumbs, step-by-step jump navigation, undo, and redo.
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

/**
 * Base props for `<PopoverTimeline>`.
 */
export interface PopoverTimelineBaseProps {
  /** Optional custom CSS class name. */
  className?: string;
  /** Children elements or a render prop function receiving the timeline scope. */
  children?: ReactNode | ((scope: PopoverTimelineScope) => ReactNode);
}

export type PopoverTimelineProps<E extends ElementType = 'nav'> = PolymorphicProps<
  E,
  PopoverTimelineBaseProps
>;

/**
 * Root `<PopoverTimeline>` Headless Component.
 * Renders an interactive visual breadcrumb / history timeline for popover trail navigation.
 *
 * @remarks
 * Renders as a polymorphic navigation container (`as="nav"` by default).
 * Includes compound subcomponents:
 * - `PopoverTimeline.StepList`: Container list of active trail steps.
 * - `PopoverTimeline.Step`: Clickable breadcrumb button jumping directly to a step in the trail.
 * - `PopoverTimeline.UndoButton`: Button to undo the last popover action.
 * - `PopoverTimeline.RedoButton`: Button to redo the last undone popover action.
 *
 * @example
 * ```tsx
 * import { PopoverTimeline } from 'popover-trail';
 *
 * export function NavigationBar() {
 *   return (
 *     <PopoverTimeline className="trail-breadcrumbs">
 *       <PopoverTimeline.UndoButton>Undo</PopoverTimeline.UndoButton>
 *       <PopoverTimeline.StepList>
 *         {({ step, index, isActive }) => (
 *           <PopoverTimeline.Step step={step} index={index}>
 *             {step.key}
 *           </PopoverTimeline.Step>
 *         )}
 *       </PopoverTimeline.StepList>
 *       <PopoverTimeline.RedoButton>Redo</PopoverTimeline.RedoButton>
 *     </PopoverTimeline>
 *   );
 * }
 * ```
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
