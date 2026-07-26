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

    expect(snapshot.version).toBe('1.0.2');
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
});
