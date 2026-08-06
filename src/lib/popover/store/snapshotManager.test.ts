import { describe, it, expect, beforeEach } from 'vitest';
import { PopoverSnapshotManager } from './snapshotManager';

describe('PopoverSnapshotManager', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  });

  it('should generate a valid snapshot object', () => {
    const manager = new PopoverSnapshotManager();
    const snapshot = manager.createSnapshot(['card-1'], ['card-2'], { 'card-1': { x: 10, y: 20 } });

    expect(snapshot.version).toBe('1.0.3');
    expect(snapshot.trailKeys).toEqual(['card-1']);
    expect(snapshot.pinnedKeys).toEqual(['card-2']);
    expect(snapshot.offsets).toEqual({ 'card-1': { x: 10, y: 20 } });
  });

  it('should save and load snapshot gracefully when storage is unavailable or none', () => {
    const manager = new PopoverSnapshotManager({ storageType: 'none' });
    const snapshot = manager.createSnapshot(['card-1'], [], {});

    manager.saveSnapshot(snapshot);
    expect(manager.loadSnapshot()).toBeNull();
  });

  it('supports custom serialize and deserialize callbacks', () => {
    let rawStore = '';
    const manager = new PopoverSnapshotManager({
      serialize: (data) => {
        rawStore = JSON.stringify(data);
        return rawStore;
      },
      deserialize: (raw) => JSON.parse(raw),
    });

    const snapshot = manager.createSnapshot(['root-1'], ['pinned-1'], {
      'root-1': { x: 5, y: 15 },
    });
    expect(snapshot.trailKeys).toEqual(['root-1']);
    expect(snapshot.pinnedKeys).toEqual(['pinned-1']);
  });

  it('destroys BroadcastChannel resources on destroy()', () => {
    const manager = new PopoverSnapshotManager({
      enableBroadcastChannel: true,
      storageKey: 'test-destroy-key',
    });

    expect(() => manager.destroy()).not.toThrow();
  });
});
