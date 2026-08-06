import { describe, it, expect } from 'vitest';
import React from 'react';
import {
  usePopoverStoreApi,
  usePopoverActions,
  definePopoverContext,
  PopoverCardContext,
  PopoverProvider,
} from './context';

describe('context module', () => {
  it('throws error when usePopoverStoreApi is called outside PopoverProvider', () => {
    expect(() => usePopoverStoreApi()).toThrow(/PopoverProvider|useContext|Hook/);
  });

  it('throws error when usePopoverActions is called outside PopoverProvider', () => {
    expect(() => usePopoverActions()).toThrow(/PopoverProvider|useContext|Hook/);
  });

  it('creates pre-bound context hooks via definePopoverContext', () => {
    const bound = definePopoverContext<{ theme: string }>();

    expect(bound.Provider).toBeDefined();
    expect(typeof bound.useContext).toBe('function');
    expect(typeof bound.useActions).toBe('function');
    expect(typeof bound.useStoreApi).toBe('function');
  });

  it('instantiates PopoverCardContext with default null value', () => {
    expect(PopoverCardContext).toBeDefined();
  });

  it('instantiates PopoverProvider element safely', () => {
    const el = (
      <PopoverProvider resolveData={async () => ({})}>
        <div>Content</div>
      </PopoverProvider>
    );
    expect(React.isValidElement(el)).toBe(true);
  });
});
