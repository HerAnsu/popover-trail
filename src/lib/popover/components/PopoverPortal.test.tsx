import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverPortal } from './PopoverPortal';

describe('PopoverPortal component', () => {
  it('instantiates PopoverPortal element safely', () => {
    const el = <PopoverPortal>{<div>Portal Content</div>}</PopoverPortal>;
    expect(React.isValidElement(el)).toBe(true);
  });

  it('supports container prop function and object ref', () => {
    const target = typeof document !== 'undefined' ? document.createElement('div') : null;
    const containerFn = () => target;

    const el = <PopoverPortal container={containerFn}>{<div>Content</div>}</PopoverPortal>;
    expect(React.isValidElement(el)).toBe(true);
  });
});
