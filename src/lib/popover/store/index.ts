/**
 * Unified Store Module Facade for popover-trail.
 * Export barrel for all store engine factories, state reducers, domain action slices,
 * middleware engines, and snapshot persistence managers.
 *
 * @module store
 */

// Composition Root & Core Store Engine
export { createPopoverStore } from '../store';

// Default State Provider
export { getInitialStoreState } from './storeDefaults';

// Pure State Reducers
export {
  openRootState,
  pushNestedState,
  togglePinState,
  closeFromState,
  bringToFrontPatch,
  getCleanupStatePatch,
  getRemovedKeysForClose,
  getSnapshotStatePatch,
  updateEntryInLists,
} from './storeReducers';

// Pure Store State Selectors
export {
  selectActiveTrail,
  selectFloatingEntries,
  selectEntryByKey,
  selectTopmostEntry,
  selectIsPinned,
  selectOffset,
  selectZIndexOrder,
  selectTotalActiveCount,
  selectIsIdle,
  selectHasEntry,
} from './storeSelectors';

// Data Resolver Pipeline
export { resolvePopoverEntry } from './storeResolverPipeline';

// Middleware Engine
export { PopoverMiddlewareEngine } from './storeMiddlewareEngine';

// Store Managers
export { createBatchingManager } from './storeBatching';
export { createControllerManager } from './storeControllers';
export { createHydrationManager } from './storeHydration';
export { createTimerManager } from './timers';
export { createHistoryManager } from './history';

// State Machine & Snapshot Session Persistence
export { createPopoverFSM } from './fsm';
export { PopoverSnapshotManager, SNAPSHOT_VERSION } from './snapshotManager';
export type { PopoverSnapshotData, SnapshotManagerOptions } from './snapshotManager';

// Domain Action Registry & Action Slices
export { createStoreActions } from './storeActionRegistry';
export type { ActionRegistryDependencies } from './storeActionRegistry';
export type { SliceContext } from './slices/sliceContext';
export { createTrailSlice } from './slices/sliceTrail';
export { createPinningSlice } from './slices/slicePinning';
export { createResolverSlice } from './slices/sliceResolver';
export { createConfigSlice } from './slices/sliceConfig';
export { createPersistenceSlice } from './slices/slicePersistence';
