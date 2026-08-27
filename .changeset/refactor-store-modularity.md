---
'popover-trail': patch
---

Store internals: single sources of truth and deduplicated logic.

- `utils/safeKeys.ts` centralizes prototype-pollution guards (replaces 7 local copies).
- Reserved core action names are now derived from the composed slices instead of a hand-maintained 54-entry list.
- New shared reducers/helpers: `patchEntryInLists`, trail `closeKeys` pipeline, `runTracked` in-flight dedup, FSM state builders.
- CQRS query bus delegates to `storeSelectors`; resolver pipeline functions accept argument bundles.
- `slicePersistence` split into `sliceSubscriptions`, `sliceTransactions`, `slicePersistence`; new shared persistence kernel (`store/persistence/persistenceCore`) with stable per-instance `tabId` in persisted snapshots.
- React coupling removed from store helpers via injected `scheduleTransition`.
- Deprecated (still functional): `actions.clear/closeAll`, `commandBus.openNested/clearAll`, `scheduler.scheduleExit`, `reduceTogglePinState/reduceUpdateOffsetState`, `globalPopoverEventBus`. Prefer `clearTrail`, `pushNested`, `scheduleExitTransition`, direct reducer imports, and the per-store event bus.
