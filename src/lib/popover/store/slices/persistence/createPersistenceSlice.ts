/**
 * Store Persistence Slice Implementation.
 *
 * @module store/slices/persistence/createPersistenceSlice
 */

import type { PopoverActions, PopoverPersistConfig } from '../../../types';
import { isRecordObject } from '../../../utils/typeGuards';
import { generateTabId } from '../../../utils/uuid';
import { safeJsonParse, safeJsonStringify } from '../../persistence';
import type { SliceContext } from '../context';
import { destroyStoreResources } from './destroy';
import { buildPersistPayload } from './persistPayload';
import { applyRehydratedState } from './rehydrationApplier';
import { resolveStorageEngine } from './storageEngineResolver';

export function createPersistenceSlice<TData, TContext, TPopoverKey extends string = string>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
): Pick<
  PopoverActions<TData, TContext, TPopoverKey>,
  'persistState' | 'rehydrateState' | 'destroy'
> {
  const { set, get, deps } = ctx;
  const { popoverDAG } = deps;
  const tabId = generateTabId();

  return {
    persistState: async (config?: PopoverPersistConfig): Promise<void> => {
      const { storageKey, engine } = resolveStorageEngine(config);
      if (!engine) return;

      const state = get();
      const payload = buildPersistPayload(state, tabId, config);
      const serialize = config?.serialize ?? safeJsonStringify;
      const key = config?.key ?? storageKey;

      try {
        await engine.setItem(key, serialize(payload));
      } catch {
        // Ignore storage write errors
      }
    },

    rehydrateState: async (config?: PopoverPersistConfig): Promise<boolean> => {
      const { storageKey, engine } = resolveStorageEngine(config);
      if (!engine) return false;

      const key = config?.key ?? storageKey;
      try {
        const raw = await engine.getItem(key);
        if (!raw || typeof raw !== 'string') return false;

        const deserialize = config?.deserialize ?? safeJsonParse;
        const parsed = deserialize(raw);
        if (!isRecordObject(parsed)) return false;

        return applyRehydratedState<TData, TContext, TPopoverKey>(parsed, set, popoverDAG);
      } catch {
        return false;
      }
    },

    destroy: () => {
      destroyStoreResources(ctx);
    },
  };
}
