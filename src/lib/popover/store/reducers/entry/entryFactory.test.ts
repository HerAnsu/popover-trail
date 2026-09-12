import { describe, it, expect } from 'vitest';
import {
  createTrailEntryNode,
  createTrailEntry,
  createInitialTrailEntry,
  createResolvedTrailEntry,
} from './index';

describe('entryFactory module', () => {
  it('creates default TrailEntry correctly', () => {
    const entry = createTrailEntry('pop-1', undefined, null, undefined);
    expect(entry.key).toBe('pop-1');
    expect(entry.isLoading).toBe(false);
    expect(entry.error).toBeNull();
    expect(entry.transitionStatus).toBe('mounting');
  });

  it('normalizes TrailEntry node with structural sharing', () => {
    const entry = createTrailEntry('pop-1', 'parent-1', null, undefined);
    const normalized = createTrailEntryNode(entry);
    expect(normalized).toBe(entry);

    const rootNormalized = createTrailEntryNode(entry, { isRoot: true });
    expect(rootNormalized.parentKey).toBeUndefined();
    expect(rootNormalized.originalParentKey).toBe('parent-1');
  });

  it('constructs initial TrailEntry node', () => {
    const initial = createInitialTrailEntry('pop-initial', { isLoading: true });
    expect(initial.key).toBe('pop-initial');
    expect(initial.isLoading).toBe(true);
    expect(initial.transitionStatus).toBe('mounted');
  });

  it('transitions existing entry to resolved state', () => {
    const initial = createTrailEntry(
      'pop-init',
      undefined,
      null,
      undefined,
      undefined,
      undefined,
      null,
      true,
    );
    const resolved = createResolvedTrailEntry(initial, { foo: 'bar' });
    expect(resolved.data).toEqual({ foo: 'bar' });
    expect(resolved.isLoading).toBe(false);
    expect(resolved.status).toBe('success');
  });
});
