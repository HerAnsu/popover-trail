import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverCardCloseButton } from './PopoverCardCloseButton';

describe('PopoverCardCloseButton component', () => {
  it('instantiates PopoverCardCloseButton element', () => {
    const el = <PopoverCardCloseButton>Close</PopoverCardCloseButton>;
    expect(React.isValidElement(el)).toBe(true);
  });
});
