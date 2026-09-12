import { describe, it, expect } from 'vitest';
import { matchEntryState } from './matchEntryState';
import type { TrailEntry, PopoverEntryDiscriminatedState } from '../types/entryTypes';

describe('matchEntryState pattern matching utility', () => {
  it('matches loading state on TrailEntry', () => {
    const entry = {
      key: 'card-1',
      status: 'loading' as const,
      isLoading: true,
      data: null,
      error: null,
    } as TrailEntry<string>;

    const result = matchEntryState(entry, {
      loading: (e) => `loading:${e.key}`,
      error: (e) => `error:${e.key}`,
      success: (e) => `success:${e.key}`,
    });

    expect(result).toBe('loading:card-1');
  });

  it('matches error state on TrailEntry', () => {
    const errorObj = new Error('fetch failure');
    const entry = {
      key: 'card-2',
      status: 'error' as const,
      isLoading: false,
      data: null,
      error: errorObj,
    } as TrailEntry<string>;

    const result = matchEntryState(entry, {
      loading: () => 'loading',
      error: (e) => `error:${e.error.message}`,
      success: () => 'success',
    });

    expect(result).toBe('error:fetch failure');
  });

  it('matches success state on TrailEntry', () => {
    const entry = {
      key: 'card-3',
      status: 'success' as const,
      isLoading: false,
      data: 'card-data-content',
      error: null,
    } as TrailEntry<string>;

    const result = matchEntryState(entry, {
      loading: () => 'loading',
      error: () => 'error',
      success: (e) => `data:${e.data}`,
    });

    expect(result).toBe('data:card-data-content');
  });

  it('matches discriminated state union correctly', () => {
    const loadingState: PopoverEntryDiscriminatedState<number> = {
      status: 'loading',
      isLoading: true,
      data: undefined,
      error: null,
    };
    const successState: PopoverEntryDiscriminatedState<number> = {
      status: 'success',
      isLoading: false,
      data: 42,
      error: null,
    };
    const errorState: PopoverEntryDiscriminatedState<number> = {
      status: 'error',
      isLoading: false,
      data: undefined,
      error: new Error('boom'),
    };

    const matcher = {
      loading: () => 'in-flight',
      success: (s: { status: 'success'; data: number }) => `val:${s.data}`,
      error: (e: { status: 'error'; error: Error }) => `err:${e.error.message}`,
    };

    expect(matchEntryState(loadingState, matcher)).toBe('in-flight');
    expect(matchEntryState(successState, matcher)).toBe('val:42');
    expect(matchEntryState(errorState, matcher)).toBe('err:boom');
  });

  it('infers status from legacy isLoading/error flags when status is absent', () => {
    const legacyLoading = {
      key: 'legacy-1',
      isLoading: true,
      data: null,
      error: null,
    } as unknown as TrailEntry<string>;

    const legacyError = {
      key: 'legacy-2',
      isLoading: false,
      data: null,
      error: new Error('legacy fail'),
    } as unknown as TrailEntry<string>;

    const legacySuccess = {
      key: 'legacy-3',
      isLoading: false,
      data: 'done',
      error: null,
    } as unknown as TrailEntry<string>;

    const matcher = {
      loading: () => 'L',
      error: () => 'E',
      success: () => 'S',
    };

    expect(matchEntryState(legacyLoading, matcher)).toBe('L');
    expect(matchEntryState(legacyError, matcher)).toBe('E');
    expect(matchEntryState(legacySuccess, matcher)).toBe('S');
  });
});
