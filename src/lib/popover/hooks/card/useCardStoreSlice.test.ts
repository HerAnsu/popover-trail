import { describe, it, expect, vi } from 'vitest';
import type { PopoverStore, TrailEntry } from '../../types';
import { useCardStoreSlice } from './useCardStoreSlice';
import { usePopoverStore } from '../../context/usePopoverStore';
import { shallowEqual } from '../../utils/equality';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useCallback: <T extends (...args: readonly unknown[]) => unknown>(fn: T): T => fn,
  };
});

let capturedSelector: ((state: PopoverStore) => unknown) | null = null;
let capturedEqualityFn: unknown = null;

vi.mock('../../context/usePopoverStore', () => ({
  usePopoverStore: vi.fn((selector: (state: PopoverStore) => unknown, equalityFn: unknown) => {
    capturedSelector = selector;
    capturedEqualityFn = equalityFn;
    return null;
  }),
}));

describe('useCardStoreSlice', () => {
  const createMockStore = (overrides?: Partial<PopoverStore>): PopoverStore =>
    ({
      offsets: {},
      zIndexOrder: [],
      enableArrowNavigation: true,
      trail: [],
      floating: [],
      baseZIndex: 1000,
      mountingClassName: 'm-in',
      unmountingClassName: 'm-out',
      mountedClassName: 'm-done',
      zIndexBaseMap: { modal: 2000 },
      ...overrides,
    }) as unknown as PopoverStore;

  it('subscribes with selector and shallowEqual equality function', () => {
    useCardStoreSlice('card-1');
    expect(capturedEqualityFn).toBe(shallowEqual);
    expect(usePopoverStore).toHaveBeenCalled();
  });

  it('resolves defaults when entryKey is not present in store state', () => {
    useCardStoreSlice('card-empty');
    if (!capturedSelector) throw new Error('Expected selector to be captured');

    const state = createMockStore();
    const slice = capturedSelector(state) as ReturnType<typeof useCardStoreSlice>;

    expect(slice.offset).toEqual({ x: 0, y: 0 });
    expect(slice.zIndex).toBe(-1);
    expect(slice.isTop).toBe(false);
    expect(slice.enableArrowNavigation).toBe(true);
    expect(slice.baseZIndex).toBe(1000);
    expect(slice.mountingClassName).toBe('m-in');
    expect(slice.zIndexBaseMap).toEqual({ modal: 2000 });
  });

  it('extracts offset, zIndex, and isTop when entryKey exists in zIndexOrder', () => {
    useCardStoreSlice('card-top');
    if (!capturedSelector) throw new Error('Expected selector to be captured');

    const entry: TrailEntry = { key: 'card-top', isLoading: false, error: null };
    const state = createMockStore({
      offsets: { 'card-top': { x: 15, y: 25 } },
      zIndexOrder: ['card-other', 'card-top'],
      trail: [entry],
      floating: [entry],
    });

    const slice = capturedSelector(state) as ReturnType<typeof useCardStoreSlice>;

    expect(slice.offset).toEqual({ x: 15, y: 25 });
    expect(slice.zIndex).toBe(1);
    expect(slice.isTop).toBe(true);
    expect(slice.trail).toEqual([entry]);
    expect(slice.floating).toEqual([entry]);
  });

  it('marks isTop as false when entryKey is not the last item in zIndexOrder', () => {
    useCardStoreSlice('card-lower');
    if (!capturedSelector) throw new Error('Expected selector to be captured');

    const state = createMockStore({
      zIndexOrder: ['card-lower', 'card-higher'],
    });

    const slice = capturedSelector(state) as ReturnType<typeof useCardStoreSlice>;

    expect(slice.zIndex).toBe(0);
    expect(slice.isTop).toBe(false);
  });
});
