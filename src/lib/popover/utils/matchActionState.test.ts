import { describe, it, expect } from 'vitest';
import { matchActionState } from './matchActionState';
import type { PopoverActionState } from '../types/react19Types';

describe('matchActionState', () => {
  it('matches idle state correctly', () => {
    const state: PopoverActionState<{ count: number }> = {
      status: 'idle',
      data: { count: 0 },
      isOptimistic: false,
    };

    const result = matchActionState(state, {
      idle: (data) => `idle: ${data?.count ?? -1}`,
      pending: () => 'pending',
      success: () => 'success',
      error: () => 'error',
    });

    expect(result).toBe('idle: 0');
  });

  it('matches pending state correctly with optimistic flag', () => {
    const state: PopoverActionState<string> = {
      status: 'pending',
      data: 'optimistic-val',
      isOptimistic: true,
    };

    const result = matchActionState(state, {
      idle: () => 'idle',
      pending: (data, isOptimistic) =>
        `pending: ${data} (${isOptimistic ? 'optimistic' : 'normal'})`,
      success: () => 'success',
      error: () => 'error',
    });

    expect(result).toBe('pending: optimistic-val (optimistic)');
  });

  it('matches success state correctly', () => {
    const state: PopoverActionState<{ id: string }> = {
      status: 'success',
      data: { id: 'item-123' },
      isOptimistic: false,
    };

    const result = matchActionState(state, {
      idle: () => 'idle',
      pending: () => 'pending',
      success: (data) => `success: ${data.id}`,
      error: () => 'error',
    });

    expect(result).toBe('success: item-123');
  });

  it('matches error state correctly with error payload and data', () => {
    const testError = new Error('Network error');
    const state: PopoverActionState<string> = {
      status: 'error',
      data: 'fallback-val',
      error: testError,
      isOptimistic: false,
    };

    const result = matchActionState(state, {
      idle: () => 'idle',
      pending: () => 'pending',
      success: () => 'success',
      error: (err, data) => `error: ${err.message}, fallback: ${data}`,
    });

    expect(result).toBe('error: Network error, fallback: fallback-val');
  });
});
