/**
 * Memoized Timeline Step Component.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/timeline/PopoverTimelineStep
 */

import React, { memo, type ReactNode, type ElementType, type KeyboardEvent } from 'react';
import { clsx } from '../../utils/clsx';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverTimelineScope } from './PopoverTimelineScopeContext';
import { resolvePolymorphicProps } from '../../utils/componentUtils';
import { isArrowLeftKey, isArrowRightKey } from '../../utils/typeGuards';
import { clamp } from '../../utils/math';
import { truncate } from '../../utils/stringUtils';

export interface PopoverTimelineStepBaseProps {
  index?: number;
  stepIndex?: number;
  stepKey?: string;
  active?: boolean;
  label?: string;
  maxLabelLength?: number;
  children?: ReactNode;
}

export type PopoverTimelineStepProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  PopoverTimelineStepBaseProps
>;

function PopoverTimelineStepInner<E extends ElementType = 'button'>({
  as,
  index,
  stepIndex,
  stepKey,
  active,
  label,
  maxLabelLength,
  children,
  className,
  onClick,
  onKeyDown,
  ...restProps
}: PopoverTimelineStepProps<E>) {
  const { Component, buttonProps } = resolvePolymorphicProps(as);
  const { timeline } = usePopoverTimelineScope();
  const { currentIndex, canUndo, canRedo, history, jumpToStep } = timeline;

  const effectiveIndex = index ?? stepIndex ?? 0;
  const isCurrent = active ?? currentIndex === effectiveIndex;
  const displayLabel = label && maxLabelLength ? truncate(label, maxLabelLength) : label;
  const effectiveKey = stepKey ?? displayLabel ?? `step-${effectiveIndex}`;

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    jumpToStep(effectiveIndex);
    onClick?.(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (isArrowLeftKey(e) && canUndo) {
      e.preventDefault();
      jumpToStep(clamp(effectiveIndex - 1, 0, history.length - 1));
    } else if (isArrowRightKey(e) && canRedo) {
      e.preventDefault();
      jumpToStep(clamp(effectiveIndex + 1, 0, history.length - 1));
    }
    onKeyDown?.(e);
  };

  return (
    <Component
      {...buttonProps}
      className={clsx('pt-timeline-step', className, { 'pt-timeline-step-current': isCurrent })}
      data-index={effectiveIndex}
      data-key={effectiveKey}
      data-current={isCurrent ? 'true' : 'false'}
      aria-current={isCurrent ? 'step' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...restProps}>
      {children ?? displayLabel ?? effectiveKey}
    </Component>
  );
}

const MemoizedStep = memo(PopoverTimelineStepInner);
MemoizedStep.displayName = 'PopoverTimelineStep';

export function PopoverTimelineStep<E extends ElementType = 'button'>(
  props: PopoverTimelineStepProps<E>,
) {
  return <MemoizedStep {...props} />;
}
