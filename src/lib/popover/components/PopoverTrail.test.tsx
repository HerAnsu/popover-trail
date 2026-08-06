import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverTrail } from './PopoverTrail';

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
});
