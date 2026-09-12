import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopoverWarningCode } from './warningEngine';
import {
  validateDragOffset,
  validateStackGroup,
  validatePinDragState,
  validateQuadTreeBounds,
} from './validateSpatial';

describe('validateSpatial', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('validates drag offset coordinates (PT-114)', () => {
    validateDragOffset(Number.NaN, 50);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_DRAG_OFFSET),
    );

    warnSpy.mockClear();
    validateDragOffset(20000, 0);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_DRAG_OFFSET),
    );

    warnSpy.mockClear();
    validateDragOffset(0, -15000);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_DRAG_OFFSET),
    );

    warnSpy.mockClear();
    validateDragOffset(150, -200);
    validateDragOffset(0, 0);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates stack group filter string (PT-116)', () => {
    validateStackGroup('');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_STACK_GROUP),
    );

    warnSpy.mockClear();
    validateStackGroup('   ');
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_STACK_GROUP),
    );

    warnSpy.mockClear();
    validateStackGroup('sidebar-group');
    validateStackGroup(null);
    validateStackGroup(undefined);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates pin drag state enforcement (PT-121)', () => {
    validatePinDragState(false, false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_PIN_DRAG_STATE),
    );

    warnSpy.mockClear();
    validatePinDragState(true, false);
    validatePinDragState(false, true);
    validatePinDragState(false, undefined);
    validatePinDragState(true, true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('validates QuadTree bounding box dimensions (PT-123)', () => {
    validateQuadTreeBounds(0, 500);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_QUADTREE_BOUNDS),
    );

    warnSpy.mockClear();
    validateQuadTreeBounds(500, -10);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_QUADTREE_BOUNDS),
    );

    warnSpy.mockClear();
    validateQuadTreeBounds(Number.NaN, 500);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(PopoverWarningCode.INVALID_QUADTREE_BOUNDS),
    );

    warnSpy.mockClear();
    validateQuadTreeBounds(1920, 1080);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
