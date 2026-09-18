import { describe, expect, it } from 'vitest';
import { createConfigSlice } from './createConfigSlice';
import { createSliceTestHarness } from '../../../testing';
import type { CollisionConfig } from '../../../types';

describe('config setters validation and diffing guards', () => {
  it('rejects negative, NaN, and non-finite baseZIndex values', () => {
    const harness = createSliceTestHarness(createConfigSlice, {
      baseZIndex: 1000,
    });

    harness.actions.setBaseZIndex(-500);
    expect(harness.getState().baseZIndex).toBe(1000);

    harness.actions.setBaseZIndex(-1);
    expect(harness.getState().baseZIndex).toBe(1000);

    harness.actions.setBaseZIndex(Number.NaN);
    expect(harness.getState().baseZIndex).toBe(1000);

    harness.actions.setBaseZIndex(Number.POSITIVE_INFINITY);
    expect(harness.getState().baseZIndex).toBe(1000);

    harness.actions.setBaseZIndex(3000);
    expect(harness.getState().baseZIndex).toBe(3000);
  });

  it('guards collisionConfig updates with deep equality check', () => {
    const initialConfig: CollisionConfig = { enabled: true, padding: 12, flip: true };
    const harness = createSliceTestHarness(createConfigSlice, {
      collisionConfig: initialConfig,
    });

    const prevConfigRef = harness.getState().collisionConfig;

    // Identical collision config values must not mutate collisionConfig
    harness.actions.setCollisionConfig({ enabled: true, padding: 12, flip: true });
    expect(harness.getState().collisionConfig).toBe(prevConfigRef);

    // Changed collision config values should update state
    harness.actions.setCollisionConfig({ enabled: true, padding: 24, shift: true });
    expect(harness.getState().collisionConfig).toEqual({
      enabled: true,
      padding: 24,
      shift: true,
    });
  });

  it('diffs property patches in updateConfig and omits unchanged fields', () => {
    const harness = createSliceTestHarness(createConfigSlice, {
      ownerId: 'owner-alpha',
      exitTransitionDuration: 250,
      debug: false,
    });

    // Partial update where exitTransitionDuration is unchanged
    harness.actions.updateConfig({
      ownerId: 'owner-beta',
      exitTransitionDuration: 250,
      debug: true,
    });

    expect(harness.getState().ownerId).toBe('owner-beta');
    expect(harness.getState().debug).toBe(true);
    expect(harness.getState().exitTransitionDuration).toBe(250);

    // When no fields changed, values remain stable
    const stateBefore = harness.getState();
    harness.actions.updateConfig({ ownerId: 'owner-beta', debug: true });
    expect(harness.getState().ownerId).toBe(stateBefore.ownerId);
    expect(harness.getState().debug).toBe(stateBefore.debug);
  });

  it('guards context object updates with deep equality comparison', () => {
    const harness = createSliceTestHarness(createConfigSlice, {
      context: { userId: 42, role: 'admin' },
    });

    const initialContext = harness.getState().context;
    harness.actions.setContext({ userId: 42, role: 'admin' });
    expect(harness.getState().context).toBe(initialContext);

    harness.actions.setContext({ userId: 43, role: 'member' });
    expect(harness.getState().context).toEqual({ userId: 43, role: 'member' });
  });
});
