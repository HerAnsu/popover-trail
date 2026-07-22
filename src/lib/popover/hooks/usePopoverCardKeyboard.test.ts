import { describe, it, expect, vi } from 'vitest';
import { handleCardKeyboardNavigation } from './usePopoverCard';
import type { TrailEntry } from '../types';

describe('usePopoverCard - handleCardKeyboardNavigation', () => {
  const mockEntry: TrailEntry = {
    key: 'card-key-1',
    isLoading: false,
    error: null,
  };

  it('triggers custom keyboard shortcut handler when modifier key matches', () => {
    const customHandler = vi.fn();
    const entryWithShortcuts: TrailEntry = {
      ...mockEntry,
      keyboardShortcuts: {
        'Mod+s': customHandler,
      },
    };

    const preventDefaultSpy = vi.fn();
    const mockEvent = {
      key: 's',
      ctrlKey: true,
      preventDefault: preventDefaultSpy,
    } as unknown as React.KeyboardEvent<HTMLElement>;

    handleCardKeyboardNavigation(
      mockEvent,
      null,
      entryWithShortcuts,
      true,
      false,
      [entryWithShortcuts],
      0,
      { closeFrom: vi.fn() },
    );

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(customHandler).toHaveBeenCalledWith('card-key-1');
  });

  it('does nothing for Arrow Navigation when enableArrowNavigation is false', () => {
    const closeFromSpy = vi.fn();
    const mockEvent = {
      key: 'ArrowLeft',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLElement>;

    handleCardKeyboardNavigation(
      mockEvent,
      null,
      mockEntry,
      false, // enableArrowNavigation = false
      false,
      [mockEntry],
      0,
      { closeFrom: closeFromSpy },
    );

    expect(closeFromSpy).not.toHaveBeenCalled();
  });

  it('closes cascade level on ArrowLeft when not pinned and not root node', () => {
    const closeFromSpy = vi.fn();
    const preventDefaultSpy = vi.fn();
    const mockEvent = {
      key: 'ArrowLeft',
      preventDefault: preventDefaultSpy,
    } as unknown as React.KeyboardEvent<HTMLElement>;

    const rootEntry: TrailEntry = { key: 'root-key', isLoading: false, error: null };
    const childEntry: TrailEntry = { key: 'child-key', isLoading: false, error: null };
    const trail = [rootEntry, childEntry];

    handleCardKeyboardNavigation(
      mockEvent,
      null,
      childEntry,
      true,
      false, // isPinned = false
      trail,
      0, // floatingCount = 0
      { closeFrom: closeFromSpy },
    );

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(closeFromSpy).toHaveBeenCalledWith(1);
  });
});
