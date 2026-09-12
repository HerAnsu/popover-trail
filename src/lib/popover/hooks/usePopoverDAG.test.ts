import { describe, it, expect } from 'vitest';
import {
  usePopoverDAG,
  useGeodesicPath,
  usePopoverParents,
  usePopoverChildren,
} from './usePopoverDAG';

describe('usePopoverDAG hooks', () => {
  it('exports hook functions properly', () => {
    expect(typeof usePopoverDAG).toBe('function');
    expect(typeof useGeodesicPath).toBe('function');
    expect(typeof usePopoverParents).toBe('function');
    expect(typeof usePopoverChildren).toBe('function');
  });
});
