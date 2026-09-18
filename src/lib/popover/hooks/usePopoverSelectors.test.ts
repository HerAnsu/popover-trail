import { describe, it, expect } from 'vitest';
import {
  usePopoverTrail,
  usePopoverFloating,
  usePopoverOffsets,
  usePopoverIsPinned,
  usePopoverEntry,
  usePopoverZIndex,
  usePopoverIsTopMost,
  usePopoverOffset,
  usePopoverContext,
  usePopoverCollisionConfig,
  usePopoverIsOpen,
  usePopover,
  usePopoverHydration,
  usePopoverData,
  usePopoverParentKey,
  usePopoverChildrenKeys,
  usePopoverBreadcrumbs,
  usePopoverDepth,
  usePopoverIsLoading,
  usePopoverError,
  usePopoverIsIdle,
  usePopoverActiveCount,
} from './usePopoverSelectors';

describe('usePopoverSelectors module', () => {
  it('exports core popover state selector hooks', () => {
    expect(typeof usePopoverTrail).toBe('function');
    expect(typeof usePopoverFloating).toBe('function');
    expect(typeof usePopoverOffsets).toBe('function');
    expect(typeof usePopoverIsPinned).toBe('function');
    expect(typeof usePopoverEntry).toBe('function');
    expect(typeof usePopoverZIndex).toBe('function');
    expect(typeof usePopoverIsTopMost).toBe('function');
    expect(typeof usePopoverOffset).toBe('function');
    expect(typeof usePopoverContext).toBe('function');
    expect(typeof usePopoverCollisionConfig).toBe('function');
    expect(typeof usePopoverIsOpen).toBe('function');
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

  it('exports lifecycle and status hooks', () => {
    expect(typeof usePopoverIsLoading).toBe('function');
    expect(typeof usePopoverError).toBe('function');
    expect(typeof usePopoverIsIdle).toBe('function');
    expect(typeof usePopoverActiveCount).toBe('function');
  });
});
