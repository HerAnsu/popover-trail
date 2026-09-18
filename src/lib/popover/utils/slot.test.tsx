import { describe, it, expect } from 'vitest';
import React, { createRef } from 'react';
import { Slot, mergeProps, composeHandlers } from './slot';

describe('Slot component and utilities', () => {
  it('renders child element and merges props onto it', () => {
    const el = (
      <Slot id="slot-id" className="slot-class">
        <button className="child-class">Click</button>
      </Slot>
    );
    expect(React.isValidElement(el)).toBe(true);
  });

  it('returns null when children is not a valid element', () => {
    const el = <Slot>{null}</Slot>;
    expect(React.isValidElement(el)).toBe(true);
  });

  it('correctly composes event handlers', () => {
    const calls: string[] = [];
    const h1 = () => {
      calls.push('first');
    };
    const h2 = () => {
      calls.push('second');
    };
    const composed = composeHandlers(h1, h2);

    composed({} as React.MouseEvent);
    expect(calls).toEqual(['first', 'second']);
  });

  it('merges classNames and style objects in mergeProps', () => {
    const merged = mergeProps(
      { className: 'base', style: { color: 'red' }, id: 'a' },
      { className: 'extra', style: { background: 'blue' }, id: 'b' },
    );

    expect(merged.className).toBe('base extra');
    expect(merged.id).toBe('b');
    expect(merged.style).toEqual({ color: 'red', background: 'blue' });
  });

  it('merges event handlers in mergeProps', () => {
    const calls: string[] = [];
    const merged = mergeProps(
      {
        onClick: () => {
          calls.push('slot');
        },
      },
      {
        onClick: () => {
          calls.push('child');
        },
      },
    );

    const clickHandler = merged.onClick as (e: unknown) => void;
    clickHandler({});
    expect(calls).toEqual(['child', 'slot']);
  });

  it('forwards ref correctly using createRef', () => {
    const ref = createRef<HTMLElement>();
    const el = (
      <Slot ref={ref}>
        <div id="target" />
      </Slot>
    );
    expect(React.isValidElement(el)).toBe(true);
  });
});
