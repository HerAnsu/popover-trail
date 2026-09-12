import { describe, it, expect } from 'vitest';
import { clsx } from './clsx';

describe('clsx utility', () => {
  it('handles fast-path strings', () => {
    expect(clsx('btn')).toBe('btn');
    expect(clsx('btn', 'btn-primary')).toBe('btn btn-primary');
    expect(clsx('btn', '')).toBe('btn');
    expect(clsx('', 'btn')).toBe('btn');
    expect(clsx(undefined, 'btn')).toBe('btn');
  });

  it('handles objects and conditionals', () => {
    expect(clsx('base', { active: true, disabled: false })).toBe('base active');
    expect(clsx({ a: true, b: true })).toBe('a b');
  });

  it('skips prototype pollution properties', () => {
    const malicious = JSON.parse('{"__proto__": true, "valid": true}');
    expect(clsx(malicious)).toBe('valid');
  });
});
