import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TrailEntry } from '../../types';
import { useCardPositioning } from './useCardPositioning';
import { usePopoverGeometry } from '../useGeometry';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: <T>(val: T) => ({ current: val }),
    useCallback: <T extends (...args: readonly unknown[]) => unknown>(fn: T): T => fn,
  };
});

const mockSetFloating = vi.fn();
vi.mock('../useGeometry', () => ({
  usePopoverGeometry: vi.fn(),
}));

describe('useCardPositioning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePopoverGeometry).mockReturnValue({
      finalLayoutPos: { top: 120, left: 240 },
      setFloating: mockSetFloating,
    } as unknown as ReturnType<typeof usePopoverGeometry>);
  });

  it('computes floating coordinates and applies z-index assignment correctly', () => {
    const entry: TrailEntry = {
      key: 'card-pos-1',
      isLoading: false,
      error: null,
      rect: { top: 50, left: 100, width: 80, height: 40, bottom: 90, right: 180 },
    };

    const { ref, setCombinedRef, style } = useCardPositioning({
      entry,
      index: 2,
      isPinned: false,
      placement: 'top-start',
      offset: { x: 5, y: 10 },
      zIndex: 3,
      effectiveBaseZIndex: 1000,
    });

    expect(usePopoverGeometry).toHaveBeenCalledWith({
      id: 'card-pos-1',
      anchorRect: entry.rect,
      placement: 'top-start',
      zIndex: 2,
      isDragging: false,
      isPinned: false,
      entry,
    });

    expect(style.zIndex).toBe(1003);
    expect(style.position).toBe('absolute');
    expect(style.top).toBe(120);
    expect(style.left).toBe(240);
    expect(style.transform).toContain('5px, 10px');

    const mockNode = {} as HTMLElement;
    setCombinedRef(mockNode);
    expect(mockSetFloating).toHaveBeenCalledWith(mockNode);
    expect(ref.current).toBe(mockNode);
  });

  it('prioritizes entry.placement over the default placement fallback', () => {
    const entry: TrailEntry = {
      key: 'card-pos-2',
      isLoading: false,
      error: null,
      placement: 'left-end',
    };

    useCardPositioning({
      entry,
      index: 0,
      isPinned: true,
      placement: 'right',
      offset: { x: 0, y: 0 },
      zIndex: 0,
      effectiveBaseZIndex: 500,
    });

    expect(usePopoverGeometry).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'left-end',
        isPinned: true,
      }),
    );
  });

  it('falls back to "bottom" placement when neither entry nor option placement is given', () => {
    const entry: TrailEntry = {
      key: 'card-pos-3',
      isLoading: false,
      error: null,
    };

    useCardPositioning({
      entry,
      index: 1,
      isPinned: false,
      offset: { x: 0, y: 0 },
      zIndex: 1,
      effectiveBaseZIndex: 100,
    });

    expect(usePopoverGeometry).toHaveBeenCalledWith(
      expect.objectContaining({
        placement: 'bottom',
      }),
    );
  });
});
