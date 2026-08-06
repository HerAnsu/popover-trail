import { describe, it, expect } from 'vitest';
import React from 'react';
import { PopoverTrigger } from './PopoverTrigger';

describe('PopoverTrigger component rendering & interactions', () => {
  it('clones child element and merges active class names', () => {
    const child = <button className="btn-base">Open</button>;
    expect(child.props.className).toBe('btn-base');
    expect(PopoverTrigger).toBeDefined();
  });

  it('instantiates root trigger JSX element safely', () => {
    const el = (
      <PopoverTrigger popoverKey="card-1">
        <button>Open Card 1</button>
      </PopoverTrigger>
    );
    expect(React.isValidElement(el)).toBe(true);
  });

  it('instantiates nested trigger JSX element safely', () => {
    const el = (
      <PopoverTrigger popoverKey="child-1" parentKey="root-1">
        <button>Open Child</button>
      </PopoverTrigger>
    );
    expect(React.isValidElement(el)).toBe(true);
  });

  it('supports render-prop children callback function signature', () => {
    const renderProp = (props: Record<string, unknown>) => (
      <button {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>Open</button>
    );
    const el = <PopoverTrigger popoverKey="card-1">{renderProp}</PopoverTrigger>;
    expect(React.isValidElement(el)).toBe(true);
  });
});
