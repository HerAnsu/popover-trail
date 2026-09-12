import { describe, expect, it } from 'vitest';
import { createTrailSlice } from './createTrailSlice';
import { createSliceTestHarness } from '../../../testing';
import type { TrailEntry, TrailSliceActions } from '../../../types';

describe('trail updates actions', () => {
  const createHarness = () => {
    const harness = createSliceTestHarness<
      TrailSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(createTrailSlice, {
      floating: [],
      trail: [{ key: 'node-1', isLoading: false, error: null }],
      ownerId: 'owner-1',
    });
    harness.getDAG()?.addNode('node-1');
    return harness;
  };

  it('updateEntry updates partial entry fields across floating and trail lists', () => {
    const harness = createHarness();

    harness.actions.updateEntry('node-1', { isLoading: true });
    expect(harness.getState().trail[0]?.isLoading).toBe(true);

    harness.actions.updateEntry('node-1', { error: new Error('boom') });
    expect(harness.getState().trail[0]?.error).toBeInstanceOf(Error);
  });

  it('patchEntry applies transformer function to target entry', () => {
    const harness = createHarness();

    harness.actions.patchEntry('node-1', (entry: TrailEntry) => ({
      ...entry,
      data: { count: 42 },
    }));

    expect(harness.getState().trail[0]?.data).toEqual({ count: 42 });
  });

  it('patchEntry ignores updates for non-existent keys gracefully', () => {
    const harness = createHarness();

    harness.actions.patchEntry('non-existent', (entry: TrailEntry) => ({
      ...entry,
      isLoading: true,
    }));

    expect(harness.getState().trail).toHaveLength(1);
    expect(harness.getState().trail[0]?.key).toBe('node-1');
  });

  it('setTrail updates trail list and prunes dangling nodes in PopoverDAG', () => {
    const harness = createHarness();
    expect(harness.getDAG()?.hasNode('node-1')).toBe(true);

    harness.actions.setTrail([]);
    expect(harness.getState().trail).toHaveLength(0);
    expect(harness.getDAG()?.hasNode('node-1')).toBe(false);
  });

  it('updates entry in floating list if target key is pinned', () => {
    const harness = createSliceTestHarness(createTrailSlice, {
      floating: [{ key: 'float-1', isLoading: false, error: null }],
      trail: [],
    });

    harness.actions.updateEntry('float-1', { isLoading: true });
    expect(harness.getState().floating[0]?.isLoading).toBe(true);
  });

  it('preserves other trail entries when updating target key', () => {
    const harness = createSliceTestHarness(createTrailSlice, {
      floating: [],
      trail: [
        { key: 'node-1', isLoading: false, error: null },
        { key: 'node-2', isLoading: false, error: null },
      ],
    });

    harness.actions.updateEntry('node-2', { isLoading: true });
    expect(harness.getState().trail[0]?.isLoading).toBe(false);
    expect(harness.getState().trail[1]?.isLoading).toBe(true);
  });
});
