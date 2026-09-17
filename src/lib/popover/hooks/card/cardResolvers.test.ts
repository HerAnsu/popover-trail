import { describe, it, expect } from 'vitest';
import {
  groupByStackGroup,
  resolveBaseZIndex,
  resolveButtonControls,
  resolveTransitionClass,
} from './cardResolvers';
import type { TrailEntry } from '../../types';

describe('cardResolvers', () => {
  it('groups entries by stackGroup using groupByStackGroup', () => {
    const entries: readonly TrailEntry[] = [
      { key: 'card-1', stackGroup: 'modals' },
      { key: 'card-2', stackGroup: 'tooltips' },
      { key: 'card-3', stackGroup: 'modals' },
      { key: 'card-4' },
    ];

    const grouped = groupByStackGroup(entries);
    expect(grouped.modals).toHaveLength(2);
    expect(grouped.tooltips).toHaveLength(1);
    expect(grouped.default).toHaveLength(1);
    expect(grouped.modals?.[0]?.key).toBe('card-1');
    expect(grouped.modals?.[1]?.key).toBe('card-3');
    expect(grouped.default?.[0]?.key).toBe('card-4');
  });

  it('resolves effective base z-index correctly with stackGroup mapping', () => {
    const entryWithGroup: TrailEntry = { key: 'c1', stackGroup: 'dialogs' };
    const entryWithoutGroup: TrailEntry = { key: 'c2' };
    const entryWithDirectZ: TrailEntry = { key: 'c3', baseZIndex: 5000 };

    const map = { dialogs: 2000 };
    expect(resolveBaseZIndex(entryWithGroup, map, 1000)).toBe(2000);
    expect(resolveBaseZIndex(entryWithoutGroup, map, 1000)).toBe(1000);
    expect(resolveBaseZIndex(entryWithDirectZ, map, 1000)).toBe(5000);
  });

  it('resolves card button controls with default fallbacks', () => {
    const entry: TrailEntry = { key: 'c1' };
    const controls = resolveButtonControls(entry);
    expect(controls.enablePin).toBe(true);
    expect(controls.enableClose).toBe(true);
    expect(controls.enableDrag).toBe(true);
    expect(controls.customButtons).toEqual([]);
  });

  it('resolves transition class name based on status', () => {
    const entryClasses = { mounting: 'entry-mount' };
    const globalClasses = { mounting: 'global-mount', mounted: 'global-mounted' };

    expect(resolveTransitionClass('mounting', entryClasses, globalClasses)).toBe('entry-mount');
    expect(resolveTransitionClass('mounted', entryClasses, globalClasses)).toBe('global-mounted');
    expect(resolveTransitionClass('unknown', entryClasses, globalClasses)).toBe('');
  });
});
