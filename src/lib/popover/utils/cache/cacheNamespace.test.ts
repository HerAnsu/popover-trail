import { describe, it, expect } from 'vitest';
import { SimplePopoverCache } from './SimplePopoverCache';

describe('ScopedPopoverCache (cacheNamespace)', () => {
  it('prefixes keys and isolates operations per namespace', () => {
    const parent = new SimplePopoverCache<string>(60000, 100);
    const scopeA = parent.scope('card-1');
    const scopeB = parent.scope('card-2');

    scopeA.set('title', 'Card 1 Title');
    scopeB.set('title', 'Card 2 Title');
    parent.set('global', 'Global Value');

    expect(scopeA.get('title')).toBe('Card 1 Title');
    expect(scopeB.get('title')).toBe('Card 2 Title');
    expect(parent.get('card-1:title')).toBe('Card 1 Title');
    expect(parent.get('card-2:title')).toBe('Card 2 Title');

    expect(scopeA.has('title')).toBe(true);
    expect(scopeA.has('missing')).toBe(false);

    scopeA.mutate('title', () => 'Updated Card 1');
    expect(scopeA.get('title')).toBe('Updated Card 1');

    const cleared = scopeA.clear();
    expect(cleared).toBe(1);
    expect(scopeA.has('title')).toBe(false);
    expect(scopeB.has('title')).toBe(true);
    expect(parent.has('global')).toBe(true);
  });
});
