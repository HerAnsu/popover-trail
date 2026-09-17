import { describe, it, expect } from 'vitest';
import {
  resolveDragTransform,
  isDragPermitted,
  resolveTiltConfig,
  resolveFeatureFlag,
  resolveCardFeatures,
  FIXED_CONTAINER_STYLE,
  AUTO_POINTER_STYLE,
  DISPLAY_NONE_STYLE,
  FULL_FLEX_CONTAINER_STYLE,
  RETURN_FOCUS_CONFIG,
} from './dndCardConfig';
import type { TrailEntry } from '../types';
import { ZERO_OFFSET } from '../constants';

describe('dndCardConfig', () => {
  const dummyEntry: TrailEntry = { key: 'c1' };

  describe('style constants', () => {
    it('provides immutable layout styles and focus configs', () => {
      expect(FIXED_CONTAINER_STYLE.position).toBe('fixed');
      expect(AUTO_POINTER_STYLE.pointerEvents).toBe('auto');
      expect(DISPLAY_NONE_STYLE.display).toBe('none');
      expect(FULL_FLEX_CONTAINER_STYLE.display).toBe('flex');
      expect(RETURN_FOCUS_CONFIG).toEqual({ preventScroll: true, returnFocus: true });
    });
  });

  describe('resolveDragTransform', () => {
    const physics = { rotation: 2, rotationX: 1, rotationY: -1, dragX: 10, dragY: 20 };

    it('returns offset and rotations when drag is permitted', () => {
      const offset = { x: 50, y: 70 };
      const res = resolveDragTransform(true, offset, physics);
      expect(res).toEqual({
        offset: { x: 50, y: 70 },
        dragX: 10,
        dragY: 20,
        rotation: 2,
        rotationX: 1,
        rotationY: -1,
      });
    });

    it('returns zero offset and zero rotations when drag is disallowed', () => {
      const res = resolveDragTransform(false, { x: 50, y: 70 }, physics);
      expect(res).toEqual({
        offset: ZERO_OFFSET,
        dragX: 0,
        dragY: 0,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
      });
    });
  });

  describe('isDragPermitted', () => {
    it('allows drag when all flags are enabled', () => {
      expect(isDragPermitted(dummyEntry, true, true, false)).toBe(true);
      expect(isDragPermitted(dummyEntry, true, true, true)).toBe(true);
    });

    it('disallows drag if enableDrag or buttonDrag is disabled', () => {
      expect(isDragPermitted(dummyEntry, false, true, false)).toBe(false);
      expect(isDragPermitted(dummyEntry, true, false, false)).toBe(false);
    });

    it('respects entry allowDragWhenPinned and allowDragWhenUnpinned flags', () => {
      const pinDisabledEntry: TrailEntry = { key: 'c2', allowDragWhenPinned: false };
      const unpinDisabledEntry: TrailEntry = { key: 'c3', allowDragWhenUnpinned: false };

      expect(isDragPermitted(pinDisabledEntry, true, true, true)).toBe(false);
      expect(isDragPermitted(pinDisabledEntry, true, true, false)).toBe(true);
      expect(isDragPermitted(unpinDisabledEntry, true, true, false)).toBe(false);
      expect(isDragPermitted(unpinDisabledEntry, true, true, true)).toBe(true);
    });
  });

  describe('resolveTiltConfig', () => {
    it('uses fallback values when entry does not specify overrides', () => {
      const res = resolveTiltConfig(dummyEntry, true, 10, 5);
      expect(res).toEqual({
        tiltEnabled: true,
        maxTilt: 10,
        sensitivity: 5,
        axis: 'both',
        friction: 0.95,
        decay: 0.82,
      });
    });

    it('prioritizes entry-level tilt overrides', () => {
      const customEntry: TrailEntry = {
        key: 'c4',
        enableTilt: false,
        maxTiltAngle: 25,
        tiltSensitivity: 15,
        dragAxis: 'x',
        tiltFriction: 0.8,
        tiltDecay: 0.6,
      };
      const res = resolveTiltConfig(customEntry, true, 10, 5);
      expect(res).toEqual({
        tiltEnabled: false,
        maxTilt: 25,
        sensitivity: 15,
        axis: 'x',
        friction: 0.8,
        decay: 0.6,
      });
    });
  });

  describe('resolveFeatureFlag & resolveCardFeatures', () => {
    it('resolves feature flag precedence: featureVal > propVal > default true', () => {
      expect(resolveFeatureFlag(false, true)).toBe(false);
      expect(resolveFeatureFlag(undefined, false)).toBe(false);
      expect(resolveFeatureFlag(undefined, undefined)).toBe(true);
    });

    it('extracts card features from props and feature object', () => {
      const props = {
        entry: dummyEntry,
        index: 0,
        isPinned: false,
        children: null,
        features: { drag: false, tilt: true },
        enableFocusLock: false,
      };
      const features = resolveCardFeatures(props);
      expect(features).toEqual({
        dragEnabled: false,
        tiltEnabled: true,
        focusLockEnabled: false,
      });
    });
  });
});
