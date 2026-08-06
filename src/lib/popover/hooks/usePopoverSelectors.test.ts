import { describe, it, expect } from 'vitest';
import {
  usePopoverTrail,
  usePopoverFloating,
  usePopoverOffsets,
  useIsPopoverPinned,
  usePopoverEntry,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverOffset,
  usePopoverContext,
  usePopoverCollisionConfig,
  useIsPopoverOpen,
  usePopover,
  usePopoverHydration,
  usePopoverData,
} from './usePopoverSelectors';

describe('usePopoverSelectors module', () => {
  it('exports popover state selector hooks', () => {
    expect(typeof usePopoverTrail).toBe('function');
    expect(typeof usePopoverFloating).toBe('function');
    expect(typeof usePopoverOffsets).toBe('function');
    expect(typeof useIsPopoverPinned).toBe('function');
    expect(typeof usePopoverEntry).toBe('function');
    expect(typeof usePopoverZIndex).toBe('function');
    expect(typeof useIsPopoverTopMost).toBe('function');
    expect(typeof usePopoverOffset).toBe('function');
    expect(typeof usePopoverContext).toBe('function');
    expect(typeof usePopoverCollisionConfig).toBe('function');
    expect(typeof useIsPopoverOpen).toBe('function');
    expect(typeof usePopover).toBe('function');
    expect(typeof usePopoverHydration).toBe('function');
    expect(typeof usePopoverData).toBe('function');
  });
});
