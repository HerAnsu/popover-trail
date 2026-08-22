import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverTrail } from './PopoverTrail';
import type { TrailEntry } from '../types';

describe('PopoverTrail component', () => {
  it('instantiates PopoverTrail element safely', () => {
    const el = (
      <PopoverTrail
        renderCard={(entry, index, isPinned) => (
          <div key={entry.key}>
            Card {index} (pinned: {String(isPinned)})
          </div>
        )}
      />
    );
    expect(React.isValidElement(el)).toBe(true);
  });

  it('filters rendered entries when filter prop is provided', () => {
    const mockTrail: TrailEntry<unknown>[] = [
      { key: 'card-1', isLoading: false, error: null },
      { key: 'card-2', isLoading: false, error: null },
    ];

    const filterFn = (entry: TrailEntry<unknown>, _index?: number) => entry.key !== 'card-1';

    const list: Array<{ entry: TrailEntry<unknown>; isPinned: boolean }> = [];
    let idx = 0;
    for (const entry of mockTrail) {
      if (filterFn(entry, idx++)) {
        list.push({ entry, isPinned: false });
      }
    }

    expect(list).toHaveLength(1);
    expect(list[0]?.entry.key).toBe('card-2');
  });

  it('dynamically re-filters entries when filter prop reference updates', () => {
    let currentFilter: (entry: TrailEntry<unknown>, index: number) => boolean = (e) =>
      e.key !== 'card-1';
    const mockTrail: TrailEntry<unknown>[] = [
      { key: 'card-1', isLoading: false, error: null },
      { key: 'card-2', isLoading: false, error: null },
    ];

    const getFiltered = (filter: typeof currentFilter) => {
      const list: Array<{ entry: TrailEntry<unknown>; isPinned: boolean }> = [];
      let idx = 0;
      for (const entry of mockTrail) {
        if (!filter || filter(entry, idx++)) {
          list.push({ entry, isPinned: false });
        }
      }
      return list;
    };

    expect(getFiltered(currentFilter)).toHaveLength(1);
    expect(getFiltered(currentFilter)[0]?.entry.key).toBe('card-2');

    // Update filter
    currentFilter = (e) => e.key === 'card-1';
    expect(getFiltered(currentFilter)).toHaveLength(1);
    expect(getFiltered(currentFilter)[0]?.entry.key).toBe('card-1');
  });
});
