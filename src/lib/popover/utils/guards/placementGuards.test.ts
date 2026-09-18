import { describe, it, expect } from 'vitest';
import {
  isPopoverPlacement,
  isSide,
  isAlignment,
  isAutoPlacement,
  isVerticalPlacement,
  isHorizontalPlacement,
  isResponsiveMode,
  isLayoutStrategy,
} from './placementGuards';

describe('placementGuards', () => {
  it('validates placements and orientation', () => {
    expect(isPopoverPlacement('top-start')).toBe(true);
    expect(isPopoverPlacement('bottom')).toBe(true);
    expect(isPopoverPlacement('auto')).toBe(true);
    expect(isPopoverPlacement('invalid-placement')).toBe(false);
    expect(isPopoverPlacement(null)).toBe(false);

    expect(isVerticalPlacement('top-start')).toBe(true);
    expect(isVerticalPlacement('bottom-end')).toBe(true);
    expect(isVerticalPlacement('left-start')).toBe(false);

    expect(isHorizontalPlacement('left')).toBe(true);
    expect(isHorizontalPlacement('right-end')).toBe(true);
    expect(isHorizontalPlacement('top')).toBe(false);
  });

  it('validates side, alignment, and auto placements', () => {
    expect(isSide('top')).toBe(true);
    expect(isSide('center')).toBe(false);

    expect(isAlignment('start')).toBe(true);
    expect(isAlignment('end')).toBe(true);
    expect(isAlignment('middle')).toBe(false);

    expect(isAutoPlacement('auto')).toBe(true);
    expect(isAutoPlacement('auto-end')).toBe(true);
    expect(isAutoPlacement('manual')).toBe(false);
  });

  it('validates responsive modes and layout strategies', () => {
    expect(isResponsiveMode('bottom-sheet')).toBe(true);
    expect(isResponsiveMode('modal')).toBe(true);
    expect(isResponsiveMode('popover')).toBe(true);
    expect(isResponsiveMode('auto')).toBe(true);
    expect(isResponsiveMode('none')).toBe(true);
    expect(isResponsiveMode('sidebar')).toBe(false);

    expect(isLayoutStrategy('floating-ui')).toBe(true);
    expect(isLayoutStrategy('fixed-center')).toBe(true);
    expect(isLayoutStrategy('docked-bottom')).toBe(true);
    expect(isLayoutStrategy('docked-top')).toBe(true);
    expect(isLayoutStrategy('custom')).toBe(true);
    expect(isLayoutStrategy('floating')).toBe(true);
    expect(isLayoutStrategy('unknown-strategy')).toBe(false);
  });
});
