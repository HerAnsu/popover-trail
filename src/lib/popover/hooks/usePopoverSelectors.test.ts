import { describe, it, expect } from 'vitest';
import {
  usePopoverTrail,
  usePopoverFloating,
  usePopoverOffsets,
  useIsPopoverPinned,
  usePopoverIsPinned,
  usePopoverEntry,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverIsTopMost,
  usePopoverOffset,
  usePopoverContext,
  usePopoverCollisionConfig,
  useIsPopoverOpen,
  usePopoverIsOpen,
  usePopover,
  usePopoverHydration,
  usePopoverData,
  usePopoverParentKey,
  usePopoverChildrenKeys,
  usePopoverBreadcrumbs,
  usePopoverDepth,
  usePopoverIsLoading,
  useIsPopoverLoading,
  usePopoverError,
  useIsPopoverError,
  usePopoverIsIdle,
  useIsPopoverIdle,
} from './usePopoverSelectors';

describe('usePopoverSelectors module', () => {
  it('exports core popover state selector hooks', () => {
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

  it('exports hierarchical path and ancestry hooks', () => {
    expect(typeof usePopoverParentKey).toBe('function');
    expect(typeof usePopoverChildrenKeys).toBe('function');
    expect(typeof usePopoverBreadcrumbs).toBe('function');
    expect(typeof usePopoverDepth).toBe('function');
  });

  it('exports symmetric naming aliases matching the primary hooks', () => {
    expect(usePopoverIsOpen).toBe(useIsPopoverOpen);
    expect(usePopoverIsPinned).toBe(useIsPopoverPinned);
    expect(usePopoverIsTopMost).toBe(useIsPopoverTopMost);
    expect(usePopoverIsIdle).toBe(useIsPopoverIdle);
    expect(useIsPopoverLoading).toBe(usePopoverIsLoading);
    expect(useIsPopoverError).toBe(usePopoverError);
  });
});
