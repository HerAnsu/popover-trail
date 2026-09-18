import { describe, it, expect } from 'vitest';
import { createHistoryManager } from './history';
import { HistorySnapshotPool } from './historySnapshotPool';
import { isOk, isErr } from '../../utils/result';
import type { HistorySnapshotState } from './historyTypes';

describe('HistoryManager Monadic Operations', () => {
  it('returns undo_underflow error when undo journal is empty', () => {
    const history = createHistoryManager<string>(5);
    const state: HistorySnapshotState<string> = { ownerId: 'root' };

    const res = history.undoResult(state);
    expect(isErr(res)).toBe(true);
    if (isErr(res)) {
      expect(res.error.type).toBe('undo_underflow');
      expect(res.error.message).toContain('undo history journal is empty');
    }
  });

  it('returns redo_underflow error when redo journal is empty', () => {
    const history = createHistoryManager<string>(5);
    const state: HistorySnapshotState<string> = { ownerId: 'root' };

    const res = history.redoResult(state);
    expect(isErr(res)).toBe(true);
    if (isErr(res)) {
      expect(res.error.type).toBe('redo_underflow');
      expect(res.error.message).toContain('redo history journal is empty');
    }
  });

  it('returns ok on successful undo and redo transitions', () => {
    const history = createHistoryManager<string>(5);
    const state1: HistorySnapshotState<string> = { ownerId: 'step-1' };
    const state2: HistorySnapshotState<string> = { ownerId: 'step-2' };

    history.pushSnapshot(state1);

    const undoRes = history.undoResult(state2);
    expect(isOk(undoRes)).toBe(true);
    if (isOk(undoRes)) {
      expect(undoRes.data.ownerId).toBe('step-1');
    }

    const redoRes = history.redoResult(state1);
    expect(isOk(redoRes)).toBe(true);
    if (isOk(redoRes)) {
      expect(redoRes.data.ownerId).toBe('step-2');
    }
  });

  it('HistorySnapshotPool returns popResult and peekResult correctly', () => {
    const pool = new HistorySnapshotPool<string>(5);
    expect(isErr(pool.peekResult())).toBe(true);
    expect(isErr(pool.popResult())).toBe(true);

    const snapshot = {
      trail: [],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      ownerId: 's-1',
    };
    pool.push(snapshot);

    const peekRes = pool.peekResult();
    expect(isOk(peekRes)).toBe(true);
    if (isOk(peekRes)) {
      expect(peekRes.data.ownerId).toBe('s-1');
    }

    const popRes = pool.popResult();
    expect(isOk(popRes)).toBe(true);
    if (isOk(popRes)) {
      expect(popRes.data.ownerId).toBe('s-1');
    }
    expect(pool.isEmpty).toBe(true);
  });
});
