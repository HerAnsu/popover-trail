import { describe, it, expect } from 'vitest';
import {
  isDragAxis,
  isCascadeOffsetDirection,
  isHoverConfig,
  isCollisionConfig,
  isStateStorageEngine,
  isPopoverDisplayOptions,
} from './configGuards';

describe('configGuards', () => {
  it('validates DragAxis values', () => {
    expect(isDragAxis('x')).toBe(true);
    expect(isDragAxis('y')).toBe(true);
    expect(isDragAxis('both')).toBe(true);
    expect(isDragAxis('z')).toBe(false);
    expect(isDragAxis(null)).toBe(false);
  });

  it('validates CascadeOffsetDirection values', () => {
    expect(isCascadeOffsetDirection('right')).toBe(true);
    expect(isCascadeOffsetDirection('left')).toBe(true);
    expect(isCascadeOffsetDirection('top')).toBe(true);
    expect(isCascadeOffsetDirection('bottom')).toBe(true);
    expect(isCascadeOffsetDirection('none')).toBe(true);
    expect(isCascadeOffsetDirection('down')).toBe(true);
    expect(isCascadeOffsetDirection('up')).toBe(true);
    expect(isCascadeOffsetDirection('diagonal')).toBe(false);
  });

  it('validates HoverConfig and CollisionConfig objects', () => {
    expect(isHoverConfig({ enabled: true, openDelay: 100 })).toBe(true);
    expect(isHoverConfig({ enabled: 'true' })).toBe(false);
    expect(isHoverConfig(null)).toBe(false);

    expect(isCollisionConfig({ enabled: false })).toBe(true);
    expect(isCollisionConfig({})).toBe(false);
  });

  it('validates StateStorageEngine duck typing', () => {
    const validEngine = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
    expect(isStateStorageEngine(validEngine)).toBe(true);
    expect(isStateStorageEngine({ getItem: () => null })).toBe(false);
    expect(isStateStorageEngine(null)).toBe(false);
  });

  it('validates PopoverDisplayOptions', () => {
    expect(isPopoverDisplayOptions({ offset: 10 })).toBe(true);
    expect(isPopoverDisplayOptions(null)).toBe(false);
  });
});
