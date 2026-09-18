import { describe, it, expect } from 'vitest';
import {
  usePopoverDAG,
  useBreadcrumbPath,
  usePopoverParents,
  usePopoverChildren,
} from './usePopoverDAG';

describe('usePopoverDAG hooks', () => {
  it('exports hook functions properly', () => {
    expect(typeof usePopoverDAG).toBe('function');
    expect(typeof useBreadcrumbPath).toBe('function');
    expect(typeof usePopoverParents).toBe('function');
    expect(typeof usePopoverChildren).toBe('function');
  });
});
