import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverCardPinButton } from './PopoverCardPinButton';

describe('PopoverCardPinButton component', () => {
  it('instantiates PopoverCardPinButton element', () => {
    const el = <PopoverCardPinButton>Pin</PopoverCardPinButton>;
    expect(React.isValidElement(el)).toBe(true);
  });
});
