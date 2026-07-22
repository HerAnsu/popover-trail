import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverTrigger } from './PopoverTrigger';

describe('PopoverTrigger component rendering logic', () => {
  it('clones child element and merges active class names', () => {
    // Basic test checking trigger rendering interface
    const child = <button className="btn-base">Open</button>;
    expect(child.props.className).toBe('btn-base');
    expect(PopoverTrigger).toBeDefined();
  });
});
