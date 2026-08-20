import { describe, it, expect } from 'vitest';
import { applyThemeTokens, removeThemeTokens } from './themeTokens';

function createMockElement() {
  const styles = new Map<string, string>();
  return {
    style: {
      setProperty: (key: string, value: string) => styles.set(key, value),
      getPropertyValue: (key: string) => styles.get(key) ?? '',
      removeProperty: (key: string) => styles.delete(key),
    },
  };
}

describe('themeTokens utility', () => {
  it('applies default theme CSS variables to element', () => {
    const el = createMockElement();
    applyThemeTokens(el);

    expect(el.style.getPropertyValue('--pt-base-z-index')).toBe('1000');
    expect(el.style.getPropertyValue('--pt-cascade-offset')).toBe('24px');
    expect(el.style.getPropertyValue('--pt-transition-duration')).toBe('200ms');
    expect(el.style.getPropertyValue('--pt-backdrop-blur')).toBe('8px');
    expect(el.style.getPropertyValue('--pt-border-radius')).toBe('12px');
  });

  it('overrides theme tokens with custom options', () => {
    const el = createMockElement();
    applyThemeTokens(el, {
      baseZIndex: 5000,
      cascadeOffset: 32,
      borderRadiusPx: 8,
    });

    expect(el.style.getPropertyValue('--pt-base-z-index')).toBe('5000');
    expect(el.style.getPropertyValue('--pt-cascade-offset')).toBe('32px');
    expect(el.style.getPropertyValue('--pt-border-radius')).toBe('8px');
  });

  it('handles null element safely', () => {
    expect(() => applyThemeTokens(null)).not.toThrow();
    expect(() => removeThemeTokens(null)).not.toThrow();
  });

  it('removes custom theme tokens with removeThemeTokens and disposable handle', () => {
    const el = createMockElement();
    const disposable = applyThemeTokens(el, { baseZIndex: 2000 });
    expect(el.style.getPropertyValue('--pt-base-z-index')).toBe('2000');

    disposable.dispose();
    expect(el.style.getPropertyValue('--pt-base-z-index')).toBe('');
  });
});
