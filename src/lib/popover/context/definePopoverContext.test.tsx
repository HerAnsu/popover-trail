import { describe, it, expect } from 'vitest';
import React from 'react';
import { definePopoverContext } from './definePopoverContext';

interface AppContext {
  theme: 'dark' | 'light';
}

describe('definePopoverContext factory', () => {
  it('creates typed Provider, useContext, useActions, and useStoreApi', () => {
    const bound = definePopoverContext<AppContext>();

    expect(typeof bound.useContext).toBe('function');
    expect(typeof bound.useActions).toBe('function');
    expect(typeof bound.useStoreApi).toBe('function');
    expect(typeof bound.Provider).toBe('function');
  });

  it('renders bound Provider JSX element safely', () => {
    const { Provider } = definePopoverContext<AppContext>();
    const element = (
      <Provider initialContext={{ theme: 'dark' }}>
        <div>Child</div>
      </Provider>
    );

    expect(React.isValidElement(element)).toBe(true);
  });
});
