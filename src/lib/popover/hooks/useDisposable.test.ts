import { describe, it, expect } from 'vitest';
import { useCompositeDisposable, useDisposable } from './useDisposable';

describe('useDisposable hooks', () => {
  it('exports useCompositeDisposable and useDisposable functions', () => {
    expect(typeof useCompositeDisposable).toBe('function');
    expect(typeof useDisposable).toBe('function');
  });
});
