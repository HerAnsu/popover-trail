/**
 * Store Reducer and Collection Utilities (Re-export Facade).
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/storeHelpers
 */

export {
  updateEntryInLists,
  bringToFrontPatch,
  getCleanupStatePatch,
  openRootState,
  pushNestedState,
  togglePinState,
  closeFromState,
  getRemovedKeysForClose,
  getSnapshotStatePatch,
} from '../store/storeReducers';

export { toError } from './typeGuards';
export { shallowEqual, isDeepEqual } from './equality';
export { clsx } from './clsx';

export { getEntryAtIndex, findEntryIndex, hasEntryWithKey, findEntryInStore } from './collections';

export { isPromise, sleep, deferMicrotask } from './asyncUtils';
export { sanitizeRect } from './domUtils';

export {
  createInitialTrailEntry,
  createTrailEntry,
  createSuccessEntry,
  createLoadingEntry,
  createErrorEntry,
  createIdleEntry,
} from '../store/reducers/entry';
