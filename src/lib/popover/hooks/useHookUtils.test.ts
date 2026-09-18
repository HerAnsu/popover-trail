import { describe, it, expect, vi } from 'vitest';
import {
  useMergedRef,
  useStableCallback,
  useLatestRef,
  useIsMounted,
  usePrevious,
  setRef,
  mergeRefs,
} from './useHookUtils';

describe('useHookUtils module', () => {
  it('exports hook functions and ref helpers', () => {
    expect(typeof useMergedRef).toBe('function');
    expect(typeof useStableCallback).toBe('function');
    expect(typeof useLatestRef).toBe('function');
    expect(typeof useIsMounted).toBe('function');
    expect(typeof usePrevious).toBe('function');
    expect(typeof setRef).toBe('function');
    expect(typeof mergeRefs).toBe('function');
  });

  describe('setRef', () => {
    it('calls callback ref with node', () => {
      const fn = vi.fn();
      const node = { id: 'test-node' };
      setRef(fn, node);
      expect(fn).toHaveBeenCalledWith(node);
    });

    it('assigns to mutable ref object', () => {
      const refObj = { current: null as { id: string } | null };
      const node = { id: 'test-node' };
      setRef(refObj, node);
      expect(refObj.current).toBe(node);
    });

    it('gracefully handles null and undefined refs', () => {
      const node = { id: 'test-node' };
      expect(() => setRef(null, node)).not.toThrow();
      expect(() => setRef(undefined, node)).not.toThrow();
    });
  });

  describe('mergeRefs', () => {
    it('forwards node to all provided refs', () => {
      const fn = vi.fn();
      const refObj = { current: null as { id: string } | null };
      const combined = mergeRefs(fn, refObj, null, undefined);

      const node = { id: 'test-node' };
      combined(node);

      expect(fn).toHaveBeenCalledWith(node);
      expect(refObj.current).toBe(node);
    });
  });
});

