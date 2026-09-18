import { describe, it, expect } from 'vitest';
import { InFlightPromiseCache } from './InFlightPromiseCache';

describe('InFlightPromiseCache', () => {
  it('manages in-flight promises with identity guard', async () => {
    const cache = new InFlightPromiseCache<string>();
    const p1 = Promise.resolve('data1');
    const p2 = Promise.resolve('data2');

    cache.set('key1', p1);
    expect(cache.has('key1')).toBe(true);
    expect(cache.get('key1')).toBe(p1);

    cache.remove('key1', p2);
    expect(cache.has('key1')).toBe(true);

    cache.remove('key1', p1);
    expect(cache.has('key1')).toBe(false);
  });

  it('clears on dispose', () => {
    const cache = new InFlightPromiseCache();
    cache.set('key1', Promise.resolve('ok'));
    expect(cache.size).toBe(1);

    cache[Symbol.dispose]();
    expect(cache.size).toBe(0);
  });
});
