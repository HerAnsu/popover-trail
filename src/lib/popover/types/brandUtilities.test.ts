import { describe, it, expect } from 'vitest';
import { emptyRecord, EMPTY_ARRAY, EMPTY_OBJECT, unbrand } from './branded';

describe('Brand & Object Utilities', () => {
  it('emptyRecord returns frozen empty record singleton', () => {
    const rec = emptyRecord<string, number>();
    expect(rec).toEqual({});
    expect(Object.isFrozen(rec)).toBe(true);
    expect(rec).toBe(EMPTY_OBJECT);
  });

  it('EMPTY_ARRAY is frozen singleton', () => {
    expect(EMPTY_ARRAY).toEqual([]);
    expect(Object.isFrozen(EMPTY_ARRAY)).toBe(true);
  });

  it('unbrand strips branding and returns raw primitive at runtime', () => {
    const key = 'test-key' as import('./branded').PopoverKey;
    const rawKey = unbrand(key);
    expect(rawKey).toBe('test-key');

    const duration = 250 as import('./branded').DurationMs;
    const rawDuration = unbrand(duration);
    expect(rawDuration).toBe(250);

    const flag = true as import('./branded').Brand<boolean, 'Flag'>;
    expect(unbrand(flag)).toBe(true);
  });
});
