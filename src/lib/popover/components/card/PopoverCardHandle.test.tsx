import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverCardHandle } from './PopoverCardHandle';

describe('PopoverCardHandle component', () => {
  it('instantiates PopoverCardHandle element', () => {
    const el = <PopoverCardHandle>Handle</PopoverCardHandle>;
    expect(React.isValidElement(el)).toBe(true);
  });
});
