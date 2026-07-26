import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type ElementType,
  type KeyboardEvent,
} from 'react';
import clsx from 'clsx';
import { usePopoverTimeline, type UsePopoverTimelineResult } from '../context';
import type { PolymorphicProps } from './PopoverCard';

interface PopoverTimelineScope {
  timeline: UsePopoverTimelineResult;
}

const PopoverTimelineScopeContext = createContext<PopoverTimelineScope | null>(null);

function usePopoverTimelineScope() {
  const ctx = useContext(PopoverTimelineScopeContext);
  if (!ctx) {
    throw new Error('<PopoverTimeline> sub-components must be rendered within a <PopoverTimeline>');
  }
  return ctx;
}

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
    <PopoverTimelineScopeContext.Provider value={scope}>
      <Component className={mergedClassName} aria-label="Popover Trail Timeline" {...restProps}>
        {typeof children === 'function' ? children(scope) : children}
      </Component>
    </PopoverTimelineScopeContext.Provider>
  );
}

/**
 * Sub-component for the timeline step list container.
 */
export type PopoverTimelineStepListProps<E extends ElementType = 'ol'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

PopoverTimeline.StepList = function PopoverTimelineStepList<E extends ElementType = 'ol'>({
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
};

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

PopoverTimeline.Step = function PopoverTimelineStep<E extends ElementType = 'button'>({
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
      (onClick as (e: React.MouseEvent<HTMLElement>) => void)(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      timeline.jumpToStep(index - 1);
    } else if (e.key === 'ArrowRight' && index < timeline.history.length - 1) {
      e.preventDefault();
      timeline.jumpToStep(index + 1);
    }
    if (typeof onKeyDown === 'function') {
      (onKeyDown as (e: KeyboardEvent<HTMLElement>) => void)(e);
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
};

/**
 * Sub-component for the Undo Action Button.
 */
export type PopoverTimelineUndoButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

PopoverTimeline.UndoButton = function PopoverTimelineUndoButton<E extends ElementType = 'button'>({
  as,
  children,
  className,
  onClick,
  disabled,
  ...restProps
}: PopoverTimelineUndoButtonProps<E>) {
  const Component = as || 'button';
  const { timeline } = usePopoverTimelineScope();

  const isDisabled = disabled ?? !timeline.canUndo;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    timeline.undo();
    if (typeof onClick === 'function') {
      (onClick as (e: React.MouseEvent<HTMLElement>) => void)(e);
    }
  };

  const mergedClassName = clsx('pt-timeline-undo-btn', className);

  return (
    <Component
      className={mergedClassName}
      disabled={isDisabled}
      aria-label="Undo Popover Action"
      onClick={handleClick}
      {...restProps}>
      {children ?? 'Undo'}
    </Component>
  );
};

/**
 * Sub-component for the Redo Action Button.
 */
export type PopoverTimelineRedoButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

PopoverTimeline.RedoButton = function PopoverTimelineRedoButton<E extends ElementType = 'button'>({
  as,
  children,
  className,
  onClick,
  disabled,
  ...restProps
}: PopoverTimelineRedoButtonProps<E>) {
  const Component = as || 'button';
  const { timeline } = usePopoverTimelineScope();

  const isDisabled = disabled ?? !timeline.canRedo;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    timeline.redo();
    if (typeof onClick === 'function') {
      (onClick as (e: React.MouseEvent<HTMLElement>) => void)(e);
    }
  };

  const mergedClassName = clsx('pt-timeline-redo-btn', className);

  return (
    <Component
      className={mergedClassName}
      disabled={isDisabled}
      aria-label="Redo Popover Action"
      onClick={handleClick}
      {...restProps}>
      {children ?? 'Redo'}
    </Component>
  );
};
