import { describe, it, expect, vi } from 'vitest';
import { handleCardKeyboardNavigation, usePopoverCard } from './usePopoverCard';
import { TrailEntry } from '../types';

describe('usePopoverCard hook & keyboard navigation', () => {
  it('exports usePopoverCard hook function', () => {
    expect(typeof usePopoverCard).toBe('function');
  });

  describe('handleCardKeyboardNavigation', () => {
    it('executes custom keyboardShortcuts on entry when key matches', () => {
      const shortcutHandler = vi.fn();
      const entry: TrailEntry = {
        key: 'card-1',
        isLoading: false,
        error: null,
        keyboardShortcuts: {
          Escape: shortcutHandler,
        },
      };

      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      const actions = { closeFrom: vi.fn() };

      handleCardKeyboardNavigation(event, null, entry, true, false, [entry], 0, actions);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(shortcutHandler).toHaveBeenCalledWith('card-1');
    });

    it('closes unpinned trail popover when ArrowLeft is pressed', () => {
      const entry1: TrailEntry = { key: 'root-1', isLoading: false, error: null };
      const entry2: TrailEntry = { key: 'child-1', isLoading: false, error: null };

      const event = {
        key: 'ArrowLeft',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;

      const actions = { closeFrom: vi.fn() };

      handleCardKeyboardNavigation(event, null, entry2, true, false, [entry1, entry2], 0, actions);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(actions.closeFrom).toHaveBeenCalledWith(1);
    });
  });
});
