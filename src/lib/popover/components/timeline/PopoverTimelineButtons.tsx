import React, { type ReactNode, type ElementType } from 'react';
import { clsx } from '../../utils/clsx';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverTimelineScope } from './PopoverTimelineScopeContext';

/**
 * Sub-component for the Undo Action Button.
 *
 * @remarks
 * Dispatches `timeline.undo()` to revert to the previous historical state.
 * Automatically handles disabled state when `canUndo` is false.
 *
 * @template E - Underlying HTML element or component type (defaults to `'button'`).
 * @param props - Polymorphic button props with children and click handlers.
 * @returns Undo button element.
 */
export function PopoverTimelineUndoButton<E extends ElementType = 'button'>({
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
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    timeline.undo();
    if (typeof onClick === 'function') {
      onClick(e);
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
}

/**
 * Sub-component for the Redo Action Button.
 */
export type PopoverTimelineRedoButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

/**
 * Sub-component for the Redo Action Button.
 *
 * @remarks
 * Dispatches `timeline.redo()` to step forward in the history stack.
 * Automatically handles disabled state when `canRedo` is false.
 *
 * @template E - Underlying HTML element or component type (defaults to `'button'`).
 * @param props - Polymorphic button props with children and click handlers.
 * @returns Redo button element.
 */
export function PopoverTimelineRedoButton<E extends ElementType = 'button'>({
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
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    timeline.redo();
    if (typeof onClick === 'function') {
      onClick(e);
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
}
