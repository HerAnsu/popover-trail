import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TrailEntry } from '../types';
import { usePopoverDraggableCard } from './usePopoverDraggableCard';
import { useDraggable } from '@dnd-kit/core';
import { usePopoverCard } from '../hooks/usePopoverCard';
import { usePopoverDragAndDrop } from '../hooks/useDragAndDrop';
import { usePopoverOffset } from '../hooks/usePopoverSelectors';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useRef: <T>(initial: T) => ({ current: initial }),
    useCallback: <T extends (...args: readonly unknown[]) => unknown>(fn: T): T => fn,
  };
});

vi.mock('@dnd-kit/core', () => ({ useDraggable: vi.fn() }));
vi.mock('../hooks/usePopoverCard', () => ({ usePopoverCard: vi.fn() }));
vi.mock('../hooks/useDragAndDrop', () => ({ usePopoverDragAndDrop: vi.fn() }));
vi.mock('../hooks/usePopoverSelectors', () => ({ usePopoverOffset: vi.fn() }));

vi.mock('../hooks/useHookUtils', () => ({
  useMergedRef: (
    cardRef?: React.Ref<HTMLElement>,
    domRef?: React.RefObject<HTMLDivElement | null>,
    setNodeRef?: (node: HTMLElement | null) => void,
  ) => {
    return (node: HTMLElement | null) => {
      if (setNodeRef) setNodeRef(node);
      if (domRef && 'current' in domRef) (domRef as { current: HTMLElement | null }).current = node;
      if (typeof cardRef === 'function') cardRef(node);
    };
  },
}));

describe('usePopoverDraggableCard', () => {
  const mockSetNodeRef = vi.fn();
  const mockTogglePin = vi.fn();
  const mockEntry: TrailEntry = { key: 'test-card', isLoading: false, error: null };

  const defaultCard = {
    ref: { current: null },
    style: { top: '50px', left: '100px', zIndex: '10' },
    buttonControls: { enableDrag: true },
    actions: { togglePin: mockTogglePin },
  };

  const defaultDraggable = {
    setNodeRef: mockSetNodeRef,
    transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
    isDragging: false,
    attributes: { 'aria-roledescription': 'draggable' },
    listeners: { onPointerDown: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePopoverCard).mockReturnValue(
      defaultCard as unknown as ReturnType<typeof usePopoverCard>,
    );
    vi.mocked(useDraggable).mockReturnValue(
      defaultDraggable as unknown as ReturnType<typeof useDraggable>,
    );
    vi.mocked(usePopoverDragAndDrop).mockReturnValue(
      {} as unknown as ReturnType<typeof usePopoverDragAndDrop>,
    );
    vi.mocked(usePopoverOffset).mockReturnValue({ x: 0, y: 0 });
  });

  it('integrates with useDraggable with proper id and permitted drag state', () => {
    const result = usePopoverDraggableCard({
      entry: mockEntry,
      index: 0,
      isPinned: false,
      enableDrag: true,
    });

    expect(useDraggable).toHaveBeenCalledWith({ id: 'test-card', disabled: false });
    expect(result.isDragAllowed).toBe(true);
    expect(result.isDragging).toBe(false);
  });

  it('disables dragging when enableDrag is false or allowDragWhenPinned is false', () => {
    const resultDisabled = usePopoverDraggableCard({
      entry: mockEntry,
      index: 0,
      isPinned: false,
      enableDrag: false,
    });

    expect(useDraggable).toHaveBeenCalledWith({ id: 'test-card', disabled: true });
    expect(resultDisabled.isDragAllowed).toBe(false);
    expect(resultDisabled.dragHandleProps).toEqual({});

    const pinnedDisallowedEntry: TrailEntry = { ...mockEntry, allowDragWhenPinned: false };
    const resultPinned = usePopoverDraggableCard({
      entry: pinnedDisallowedEntry,
      index: 0,
      isPinned: true,
      enableDrag: true,
    });

    expect(resultPinned.isDragAllowed).toBe(false);
    expect(resultPinned.dragHandleProps).toEqual({});
  });

  it('supplies drag handle props with grabbing cursor when isDragging is true', () => {
    vi.mocked(useDraggable).mockReturnValue({
      ...defaultDraggable,
      isDragging: true,
    } as unknown as ReturnType<typeof useDraggable>);

    const result = usePopoverDraggableCard({ entry: mockEntry, index: 0, isPinned: false });

    expect(result.isDragging).toBe(true);
    expect(result.dragHandleProps.style?.cursor).toBe('grabbing');
    expect(result.dragHandleProps['aria-roledescription']).toBe('draggable');
  });

  it('delegates pin toggling to card actions', () => {
    const result = usePopoverDraggableCard({ entry: mockEntry, index: 0, isPinned: false });

    result.handlePinToggle();
    expect(mockTogglePin).toHaveBeenCalledWith('test-card', undefined);
  });

  it('forwards combined node ref to dnd-kit and card container', () => {
    const result = usePopoverDraggableCard({ entry: mockEntry, index: 0, isPinned: false });

    expect(typeof result.ref).toBe('function');
    const mockDomNode = {} as HTMLDivElement;
    result.ref?.(mockDomNode);

    expect(mockSetNodeRef).toHaveBeenCalledWith(mockDomNode);
  });
});
