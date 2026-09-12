import { describe, it, expect } from 'vitest';
import {
  isTransitionStatus,
  isMountedEntry,
  isUnmountingEntry,
  isMountingEntry,
} from './lifecycleGuards';
import { isTrailEntry, assertIsTrailEntry } from './entryGuards';
import { POPOVER_TRANSITION_STATUSES } from '../../types/entry/entryBase';
import { TRAIL_ENTRY_STATUSES } from '../../types/entry/entryVariants';

describe('lifecycleGuards and isTrailEntry', () => {
  it('validates isTransitionStatus correctly', () => {
    expect(isTransitionStatus('mounting')).toBe(true);
    expect(isTransitionStatus('mounted')).toBe(true);
    expect(isTransitionStatus('unmounting')).toBe(true);
    expect(isTransitionStatus('unmounted')).toBe(false);
    expect(isTransitionStatus(null)).toBe(false);
  });

  it('discriminates entry transition statuses', () => {
    const mounting = { key: '1', transitionStatus: 'mounting' as const };
    const mounted = { key: '2', transitionStatus: 'mounted' as const };
    const unmounting = { key: '3', transitionStatus: 'unmounting' as const };

    expect(isMountingEntry(mounting)).toBe(true);
    expect(isMountingEntry(mounted)).toBe(false);

    expect(isMountedEntry(mounted)).toBe(true);
    expect(isMountedEntry(unmounting)).toBe(false);

    expect(isUnmountingEntry(unmounting)).toBe(true);
    expect(isUnmountingEntry(mounting)).toBe(false);

    expect(isMountedEntry(null)).toBe(false);
    expect(isUnmountingEntry(undefined)).toBe(false);
  });

  it('validates isTrailEntry and assertIsTrailEntry', () => {
    expect(isTrailEntry({ key: 'card-1' })).toBe(true);
    expect(isTrailEntry({ key: '' })).toBe(false);
    expect(isTrailEntry({})).toBe(false);
    expect(isTrailEntry(null)).toBe(false);

    expect(() => assertIsTrailEntry({ key: 'ok' })).not.toThrow();
    expect(() => assertIsTrailEntry(null)).toThrow(TypeError);
  });

  it('exports canonical status constants', () => {
    expect(POPOVER_TRANSITION_STATUSES).toEqual(['mounting', 'mounted', 'unmounting']);
    expect(TRAIL_ENTRY_STATUSES).toEqual(['idle', 'loading', 'error', 'success']);
  });
});
