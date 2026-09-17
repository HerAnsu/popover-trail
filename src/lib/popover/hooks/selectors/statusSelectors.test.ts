import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PopoverStore } from '../../types';
import {
  usePopoverIsPinned,
  usePopoverZIndex,
  usePopoverIsTopMost,
  usePopoverContext,
  usePopoverCollisionConfig,
  usePopoverIsOpen,
} from './statusSelectors';

let capturedSelector: ((state: PopoverStore) => unknown) | null = null;

vi.mock('../../context/usePopoverStore', () => ({
  usePopoverStore: vi.fn((selector: (state: PopoverStore) => unknown) => {
    capturedSelector = selector;
    return null;
  }),
}));

describe('statusSelectors', () => {
  const mockStore: PopoverStore = {
    trail: [{ key: 'card-1' }],
    floating: [{ key: 'card-2' }],
    zIndexOrder: ['card-1', 'card-2'],
    pinnedStates: { 'card-2': true, 'card-1': false },
    context: { theme: 'dark', orgId: 42 },
    collisionConfig: { padding: 16 },
    offsets: {},
    actions: {} as PopoverStore['actions'],
  } as unknown as PopoverStore;

  beforeEach(() => {
    capturedSelector = null;
    vi.clearAllMocks();
  });

  it('selects pinned status', () => {
    usePopoverIsPinned('card-2');
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toBe(true);

    usePopoverIsPinned('card-1');
    expect(capturedSelector?.(mockStore)).toBe(false);
  });

  it('selects z-index order position', () => {
    usePopoverZIndex('card-1');
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toBe(0);

    usePopoverZIndex('card-2');
    expect(capturedSelector?.(mockStore)).toBe(1);

    usePopoverZIndex('card-unknown');
    expect(capturedSelector?.(mockStore)).toBe(-1);
  });

  it('evaluates whether entry is topmost in z-index order', () => {
    usePopoverIsTopMost('card-2');
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toBe(true);

    usePopoverIsTopMost('card-1');
    expect(capturedSelector?.(mockStore)).toBe(false);
  });

  it('selects ambient context and collision configuration', () => {
    usePopoverContext();
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toEqual({ theme: 'dark', orgId: 42 });

    usePopoverCollisionConfig();
    expect(capturedSelector?.(mockStore)).toEqual({ padding: 16 });
  });

  it('evaluates whether entry is open', () => {
    usePopoverIsOpen('card-1');
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toBe(true);

    usePopoverIsOpen('card-2');
    expect(capturedSelector?.(mockStore)).toBe(true);

    usePopoverIsOpen('card-closed');
    expect(capturedSelector?.(mockStore)).toBe(false);
  });
});
