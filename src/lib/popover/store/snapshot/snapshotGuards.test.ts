import { describe, it, expect } from 'vitest';
import { isSnapshotRestoreMessage, isValidSnapshot } from './snapshotGuards';
import { SNAPSHOT_VERSION } from './snapshotManagerTypes';

describe('snapshotGuards', () => {
  const validSnapshot = {
    version: SNAPSHOT_VERSION,
    timestamp: Date.now(),
    tabId: 'tab-1',
    trailKeys: ['a', 'b'],
    pinnedKeys: ['c'],
    offsets: { a: { x: 10, y: 20 } },
  };

  it('validates snapshot structures', () => {
    expect(isValidSnapshot(validSnapshot)).toBe(true);
    expect(isValidSnapshot(null)).toBe(false);
    expect(isValidSnapshot({ version: 999 })).toBe(false);
  });

  it('validates snapshot restore message envelopes', () => {
    expect(
      isSnapshotRestoreMessage({
        type: 'POP_RESTORE_SNAPSHOT',
        snapshot: validSnapshot,
      }),
    ).toBe(true);

    expect(
      isSnapshotRestoreMessage({
        type: 'OTHER_TYPE',
        snapshot: validSnapshot,
      }),
    ).toBe(false);

    expect(isSnapshotRestoreMessage(null)).toBe(false);
  });
});
