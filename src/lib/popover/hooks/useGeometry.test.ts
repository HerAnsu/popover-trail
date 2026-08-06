import { describe, it, expect } from 'vitest';
import { usePopoverGeometry } from './useGeometry';

describe('useGeometry hook', () => {
  it('exports usePopoverGeometry hook function', () => {
    expect(typeof usePopoverGeometry).toBe('function');
  });
});
