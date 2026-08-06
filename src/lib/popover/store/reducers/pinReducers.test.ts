import { describe, it, expect } from 'vitest';
import { togglePinState } from './pinReducers';
import { PopoverStateData, TrailEntry } from '../../types';

describe('pinReducers module', () => {
  const createMockState = (): PopoverStateData<unknown, unknown> =>
    ({
      ownerId: 'owner-1',
      floating: [],
      trail: [{ key: 'card-1', isLoading: false, error: null } as TrailEntry<unknown>],
      pinnedStates: { 'card-1': false },
      offsets: {},
      zIndexOrder: ['card-1'],
      nestedHydrationRequestCounters: {},
    }) as unknown as PopoverStateData<unknown, unknown>;

  it('pins an unpinned popover from trail into floating state', () => {
    const state = createMockState();
    const result = togglePinState(state, 'card-1');

    expect(result.floating).toHaveLength(1);
    expect(result.trail).toHaveLength(0);
    expect(result.pinnedStates?.['card-1']).toBe(true);
  });

  it('unpins a floating popover back into trail state', () => {
    const state = createMockState();
    state.floating = [{ key: 'card-1', isLoading: false, error: null } as TrailEntry<unknown>];
    state.trail = [];
    state.pinnedStates['card-1'] = true;

    const result = togglePinState(state, 'card-1');

    expect(result.floating).toHaveLength(0);
    expect(result.trail).toHaveLength(1);
    expect(result.pinnedStates?.['card-1']).toBe(false);
  });

  it('handles togglePinState when target key does not exist in store safely', () => {
    const state = createMockState();
    const result = togglePinState(state, 'non-existent-key');
    expect(result.floating).toEqual([]);
    expect(result.trail).toHaveLength(1);
  });

  it('updates entry DOMRect when DOMRect is provided during pin toggle', () => {
    const state = createMockState();
    const customRect = {
      top: 120,
      left: 240,
      width: 300,
      height: 180,
      bottom: 300,
      right: 540,
      x: 240,
      y: 120,
      toJSON: () => {},
    } as DOMRect;

    const result = togglePinState(state, 'card-1', customRect);

    expect(result.floating?.[0]?.rect?.top).toBe(120);
    expect(result.floating?.[0]?.rect?.left).toBe(240);
  });

  it('resets custom pinnedPos when unpinning back to trail', () => {
    const state = createMockState();
    state.floating = [
      {
        key: 'card-1',
        isLoading: false,
        error: null,
        pinnedLayoutPos: { top: 100, left: 100 },
      } as TrailEntry<unknown>,
    ];
    state.trail = [];
    state.pinnedStates['card-1'] = true;
    state.offsets['card-1'] = { x: 50, y: 50 };

    const result = togglePinState(state, 'card-1');

    expect(result.trail?.[0]?.pinnedLayoutPos).toBeUndefined();
  });
});
