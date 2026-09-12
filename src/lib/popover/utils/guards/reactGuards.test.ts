import { describe, it, expect } from 'vitest';
import { isRenderProp, isReactRefObject, isSyntheticEvent } from './reactGuards';

describe('reactGuards', () => {
  it('isRenderProp checks if children is a function', () => {
    expect(isRenderProp(() => 'hello')).toBe(true);
    expect(isRenderProp('plain text')).toBe(false);
    expect(isRenderProp(null)).toBe(false);
  });

  it('isReactRefObject checks for current property', () => {
    expect(isReactRefObject({ current: null })).toBe(true);
    expect(isReactRefObject({ current: { nodeType: 1 } })).toBe(true);
    expect(isReactRefObject({})).toBe(false);
    expect(isReactRefObject(null)).toBe(false);
  });

  it('isSyntheticEvent checks for React synthetic event shape', () => {
    const mockSynthetic = {
      nativeEvent: new Event('click'),
      preventDefault: () => {},
      stopPropagation: () => {},
    };
    expect(isSyntheticEvent(mockSynthetic)).toBe(true);
    expect(isSyntheticEvent(new Event('click'))).toBe(false);
    expect(isSyntheticEvent(null)).toBe(false);
  });
});
