import { describe, it, expect } from 'vitest';
import {
  isStoreActionPayload,
  isOpenRootAction,
  isPushNestedAction,
  isCloseAction,
  isTogglePinAction,
  isUpdateOffsetAction,
  isResolveAction,
} from './actionGuards';

describe('actionGuards', () => {
  it('validates StoreActionPayload and rejects invalid shapes', () => {
    expect(isStoreActionPayload({ type: 'OPEN_ROOT', key: 'card-1' })).toBe(true);
    expect(isStoreActionPayload({ type: 'UNKNOWN_ACTION' })).toBe(false);
    expect(isStoreActionPayload(null)).toBe(false);
    expect(isStoreActionPayload('OPEN_ROOT')).toBe(false);
  });

  it('discriminates specific action types accurately', () => {
    const openRoot = { type: 'OPEN_ROOT' as const, key: 'card-1' };
    const pushNested = { type: 'PUSH_NESTED' as const, key: 'card-2', parentKey: 'card-1' };
    const closeByKey = { type: 'CLOSE_BY_KEY' as const, key: 'card-2' };
    const clearTrail = { type: 'CLEAR_TRAIL' as const };
    const togglePin = { type: 'TOGGLE_PIN' as const, key: 'card-1' };
    const updateOffset = {
      type: 'UPDATE_OFFSET' as const,
      key: 'card-1',
      offset: { x: 10, y: 20 },
    };
    const resolveStart = { type: 'RESOLVE_START' as const, key: 'card-1' };

    expect(isOpenRootAction(openRoot)).toBe(true);
    expect(isOpenRootAction(pushNested)).toBe(false);

    expect(isPushNestedAction(pushNested)).toBe(true);
    expect(isCloseAction(closeByKey)).toBe(true);
    expect(isCloseAction(clearTrail)).toBe(true);
    expect(isCloseAction(openRoot)).toBe(false);

    expect(isTogglePinAction(togglePin)).toBe(true);
    expect(isUpdateOffsetAction(updateOffset)).toBe(true);
    expect(isResolveAction(resolveStart)).toBe(true);
    expect(isResolveAction(openRoot)).toBe(false);
  });
});
