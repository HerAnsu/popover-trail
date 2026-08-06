import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverCardContent } from './PopoverCardContent';

describe('PopoverCardContent component', () => {
  it('instantiates PopoverCardContent element', () => {
    const el = <PopoverCardContent>Body Content</PopoverCardContent>;
    expect(React.isValidElement(el)).toBe(true);
  });
});
