import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PopoverStore, TrailEntry } from '../../types';
import {
  usePopoverOffsets,
  usePopoverOffset,
  usePopoverEntry,
  usePopoverEntryStatus,
  usePopoverData,
  usePopoverIsLoading,
  usePopoverError,
} from './entrySelectors';

let capturedSelector: ((state: PopoverStore) => unknown) | null = null;

vi.mock('../../context/usePopoverStore', () => ({
  usePopoverStore: vi.fn((selector: (state: PopoverStore) => unknown) => {
    capturedSelector = selector;
    return null;
  }),
}));

describe('entrySelectors', () => {
  const successEntry: TrailEntry<{ id: number }> = {
    key: 'user-1',
    data: { id: 123 },
    isLoading: false,
    error: null,
  };

  const loadingEntry: TrailEntry = {
    key: 'user-2',
    isLoading: true,
    error: null,
  };

  const errorObj = new Error('Failed to resolve');
  const errorEntry: TrailEntry = {
    key: 'user-3',
    isLoading: false,
    error: errorObj,
  };

  const mockStore: PopoverStore = {
    trail: [successEntry, loadingEntry, errorEntry],
    floating: [],
    offsets: { 'user-1': { x: 10, y: 20 } },
    zIndexOrder: ['user-1', 'user-2', 'user-3'],
    actions: {} as PopoverStore['actions'],
  } as unknown as PopoverStore;

  beforeEach(() => {
    capturedSelector = null;
    vi.clearAllMocks();
  });

  it('selects all offsets and individual offset', () => {
    usePopoverOffsets();
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toEqual({ 'user-1': { x: 10, y: 20 } });

    usePopoverOffset('user-1');
    expect(capturedSelector?.(mockStore)).toEqual({ x: 10, y: 20 });

    usePopoverOffset('unknown');
    expect(capturedSelector?.(mockStore)).toEqual({ x: 0, y: 0 });
  });

  it('selects entry by key', () => {
    usePopoverEntry('user-1');
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toEqual(successEntry);

    usePopoverEntry('non-existent');
    expect(capturedSelector?.(mockStore)).toBeUndefined();
  });

  it('evaluates entry status narrowing and data', () => {
    usePopoverEntryStatus('user-1', 'success');
    expect(capturedSelector).not.toBeNull();

    usePopoverData('user-1');
    expect(capturedSelector).not.toBeNull();
  });

  it('selects loading and error states', () => {
    usePopoverIsLoading('user-2');
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toBe(true);

    usePopoverIsLoading('user-1');
    expect(capturedSelector?.(mockStore)).toBe(false);

    usePopoverError('user-3');
    expect(capturedSelector?.(mockStore)).toBe(errorObj);

    usePopoverError('user-1');
    expect(capturedSelector?.(mockStore)).toBeNull();
  });
});
