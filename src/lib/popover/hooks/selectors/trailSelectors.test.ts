import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PopoverStore, TrailEntry } from '../../types';
import {
  usePopoverTrail,
  usePopoverFloating,
  usePopoverRootEntry,
  usePopoverActiveCount,
  usePopoverIsIdle,
  usePopoverParentKey,
  usePopoverChildrenKeys,
  usePopoverBreadcrumbs,
  usePopoverDepth,
} from './trailSelectors';

let capturedSelector: ((state: PopoverStore) => unknown) | null = null;

vi.mock('../../context/usePopoverStore', () => ({
  usePopoverStore: vi.fn((selector: (state: PopoverStore) => unknown) => {
    capturedSelector = selector;
    return null;
  }),
}));

describe('trailSelectors', () => {
  const e1: TrailEntry = { key: 'root' };
  const e2: TrailEntry = { key: 'child', parentKey: 'root' };
  const ePinned: TrailEntry = { key: 'pinned-1' };

  const mockStore: PopoverStore = {
    trail: [e1, e2],
    floating: [ePinned],
    offsets: {},
    zIndexOrder: ['root', 'child', 'pinned-1'],
    actions: {} as PopoverStore['actions'],
  } as unknown as PopoverStore;

  const idleStore: PopoverStore = {
    trail: [],
    floating: [],
    offsets: {},
    zIndexOrder: [],
    actions: {} as PopoverStore['actions'],
  } as unknown as PopoverStore;

  beforeEach(() => {
    capturedSelector = null;
    vi.clearAllMocks();
  });

  it('selects active trail entries', () => {
    usePopoverTrail();
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toEqual([e1, e2]);
  });

  it('selects floating entries', () => {
    usePopoverFloating();
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toEqual([ePinned]);
  });

  it('selects root entry', () => {
    usePopoverRootEntry();
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toEqual(e1);
  });

  it('calculates total active count across trail and floating', () => {
    usePopoverActiveCount();
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toBe(3);
    expect(capturedSelector?.(idleStore)).toBe(0);
  });

  it('evaluates idle status correctly', () => {
    usePopoverIsIdle();
    expect(capturedSelector).not.toBeNull();
    expect(capturedSelector?.(mockStore)).toBe(false);
    expect(capturedSelector?.(idleStore)).toBe(true);
  });

  it('selects parent key, children keys, breadcrumbs, and depth', () => {
    usePopoverParentKey('child');
    expect(capturedSelector?.(mockStore)).toBe('root');

    usePopoverChildrenKeys('root');
    expect(capturedSelector?.(mockStore)).toEqual(['child']);

    usePopoverBreadcrumbs('child');
    expect(capturedSelector?.(mockStore)).toEqual(['root', 'child']);

    usePopoverDepth('child');
    expect(capturedSelector?.(mockStore)).toBe(1);

    usePopoverDepth('root');
    expect(capturedSelector?.(mockStore)).toBe(0);
  });
});
