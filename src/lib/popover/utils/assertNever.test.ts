import { describe, it, expect } from 'vitest';
import { assertNever } from './assertNever';

describe('assertNever', () => {
  it('throws a TypeError when invoked at runtime', () => {
    expect(() => assertNever('unhandled' as never)).toThrowError(TypeError);
    expect(() => assertNever('unhandled' as never)).toThrowError(
      '[popover-trail]: Unexpected unhandled union member: "unhandled"',
    );
  });

  it('supports a custom error message', () => {
    expect(() => assertNever('bad' as never, 'Custom failure')).toThrowError('Custom failure');
  });

  it('proves exhaustiveness for closed unions at compile time', () => {
    type State = 'idle' | 'busy';
    const testFn = (s: State): string => {
      switch (s) {
        case 'idle':
          return 'ok-idle';
        case 'busy':
          return 'ok-busy';
        default:
          return assertNever(s);
      }
    };
    expect(testFn('idle')).toBe('ok-idle');
    expect(testFn('busy')).toBe('ok-busy');
  });
});
