/**
 * Trail Stack Domain Action Slice for popover-trail.
 * Encapsulates trail stack navigation actions (openRoot, pushNested, closeFrom, closeByKey, closeAll, clearTrail, closeTopmost).
 *
 * @module store/slices/trail/createTrailSlice
 */

import type { TrailSliceActions } from '../../../types';
import type { SliceContext } from '../context';
import { createTrailTeardownRunner } from './teardown';
import { createTrailUpdateActions } from './updates';
import { createTrailOpenActions } from './open';
import { createTrailCloseActions } from './close';
import { createTrailDAGActions } from './dagActions';

/**
 * Creates the Trail Stack domain action slice.
 * Combines open, close, update, clear, and teardown orchestration methods.
 *
 * @example
 * ```ts
 * const trailSlice = createTrailSlice(ctx);
 * trailSlice.openRoot('owner-1', rootEntry);
 * trailSlice.closeByKey('rootEntryKey');
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @returns Trail stack navigation and entry manipulation methods.
 */
export function createTrailSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
): TrailSliceActions<TData, TContext, TPopoverKey> {
  const teardownRunner = createTrailTeardownRunner(ctx);
  const updateActions = createTrailUpdateActions(ctx);
  const openActions = createTrailOpenActions(ctx);
  const closeActions = createTrailCloseActions(ctx, teardownRunner.closeByTargetKeys);
  const dagActions = createTrailDAGActions(ctx);

  return {
    ...updateActions,
    ...openActions,
    ...closeActions,
    ...dagActions,
  };
}
