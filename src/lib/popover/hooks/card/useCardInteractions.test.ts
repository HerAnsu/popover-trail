import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { KeyboardEvent, RefObject } from 'react';
import type { PopoverActions, TrailEntry } from '../../types';
import { useCardInteractions } from './useCardInteractions';
import { handleCardKeyboard } from './useCardKeyboardNav';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useCallback: <T extends (...args: readonly unknown[]) => unknown>(fn: T): T => fn,
    useMemo: <T>(fn: () => T): T => fn(),
  };
});
vi.mock('./useCardKeyboardNav', () => ({ handleCardKeyboard: vi.fn() }));

describe('useCardInteractions', () => {
  const createActions = (): PopoverActions =>
    ({
      togglePin: vi.fn(),
      hoverEnter: vi.fn(),
      hoverLeave: vi.fn(),
      closeFrom: vi.fn(),
    }) as unknown as PopoverActions;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handlePinToggle obtains client rect from card element or uses undefined', () => {
    const actions = createActions();
    const mockRect = { top: 10, left: 20, width: 200, height: 150 } as DOMRect;
    const mockEl = { getBoundingClientRect: vi.fn(() => mockRect) } as unknown as HTMLElement;
    const entry: TrailEntry = { key: 'card-a', isLoading: false, error: null };

    const { handlePinToggle } = useCardInteractions({
      entry,
      isPinned: false,
      cardRef: { current: mockEl },
      actions,
      enableArrowNavigation: true,
      trail: [entry],
      floatingCount: 1,
    });
    handlePinToggle();
    expect(actions.togglePin).toHaveBeenCalledWith('card-a', mockRect);

    const { handlePinToggle: handlePinToggleNull } = useCardInteractions({
      entry,
      isPinned: false,
      cardRef: { current: null },
      actions,
      enableArrowNavigation: true,
      trail: [entry],
      floatingCount: 1,
    });
    handlePinToggleNull();
    expect(actions.togglePin).toHaveBeenCalledWith('card-a', undefined);
  });

  it('handles mouse enter and conditional mouse leave based on pinning state', () => {
    const actions = createActions();
    const entry: TrailEntry = { key: 'card-b', isLoading: false, error: null };
    const cardRef: RefObject<HTMLElement | null> = { current: null };

    const unpinned = useCardInteractions({
      entry,
      isPinned: false,
      cardRef,
      actions,
      enableArrowNavigation: true,
      trail: [entry],
      floatingCount: 1,
    });
    unpinned.onMouseEnter();
    expect(actions.hoverEnter).toHaveBeenCalledWith('card-b');
    unpinned.onMouseLeave();
    expect(actions.hoverLeave).toHaveBeenCalledWith('card-b');

    const pinned = useCardInteractions({
      entry,
      isPinned: true,
      cardRef,
      actions,
      enableArrowNavigation: true,
      trail: [entry],
      floatingCount: 1,
    });
    pinned.onMouseLeave();
    expect(actions.hoverLeave).toHaveBeenCalledTimes(1);
  });

  it('delegates keyboard events to handleCardKeyboardNavigation', () => {
    const actions = createActions();
    const entry: TrailEntry = { key: 'card-c', isLoading: false, error: null };
    const mockEl = {} as HTMLElement;
    const cardRef: RefObject<HTMLElement | null> = { current: mockEl };

    const { onKeyDown } = useCardInteractions({
      entry,
      isPinned: false,
      cardRef,
      actions,
      enableArrowNavigation: true,
      trail: [entry],
      floatingCount: 1,
    });

    const mockEvent = {
      key: 'Escape',
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent<HTMLElement>;
    onKeyDown(mockEvent);

    expect(handleCardKeyboard).toHaveBeenCalledWith({
      event: mockEvent,
      cardElement: mockEl,
      entry,
      enableArrowNavigation: true,
      isPinned: false,
      trail: [entry],
      floatingCount: 1,
      actions,
    });
  });

  it('computes buttonControls derived from entry options', () => {
    const actions = createActions();
    const entry: TrailEntry = {
      key: 'card-d',
      isLoading: false,
      error: null,
      buttonControls: { enableClose: false, enablePin: false, enableDrag: true },
    };
    const { buttonControls } = useCardInteractions({
      entry,
      isPinned: false,
      cardRef: { current: null },
      actions,
      enableArrowNavigation: false,
      trail: [entry],
      floatingCount: 0,
    });

    expect(buttonControls.enableClose).toBe(false);
    expect(buttonControls.enablePin).toBe(false);
    expect(buttonControls.enableDrag).toBe(true);
  });
});
