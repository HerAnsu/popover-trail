# Changelog

All notable changes to the `popover-trail` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-08-13

### Fixed & Hardened
- **React 19 Rules of Hooks in Portal**: Resolved hook order mismatch in `PopoverPortal.tsx` by moving `useMemo` above conditional return checks.
- **CQRS QueryBus Dynamism**: Fixed stale initial state capture in `createCQRSBuses` by providing dynamic store state evaluation getters (`getState()`).
- **Resolver Pipeline & Cancellation**: Fixed aborted promise leakage in `inFlightPromises` to prevent stale promise reuse upon re-resolution.
- **DAG Parent Cleanup**: Fixed orphaned node references in `PopoverDAG` when reparenting popover cards.
- **Worker Crash Resilience**: Added task promise rejection upon Web Worker fatal crashes to eliminate hanging promises.
- **V8 Hidden Classes Protection**: Replaced `delete` key loops in `storeHydration.ts` with safe property clearing to preserve V8 fast-mode hidden classes.

### Performance & Memory Optimizations
- **Re-render Cascade Prevention**: Memoized scope objects in `usePopoverCard` and `usePopoverTimeline`, preventing unnecessary re-renders across all compound card & timeline subcomponents.
- **QuadTree $O(N)$ Rebalancing**: Replaced `splice` inside QuadTree redistribution loops with linear array filtering, reducing spatial partitioning complexity from $O(N^2)$ to $O(N)$.
- **Zero-Allocation Close Resolvers**: Optimized pinned popover checking in `closeReducers.ts` using direct $O(1)$ `pinnedStates[key]` reads without `new Set()` allocations.
- **Integer Coordinate Hashing**: Enhanced coordinate bitwise hashing in `styles.ts` using `Math.round` and `Math.imul` to prevent float truncation hash collisions.

### Refactored & Standards
- **React 19 Context & Ref Alignment**: Migrated all Context Providers (`PopoverProvider`, `PopoverCard`, `PopoverTimeline`, `dnd`) to native React 19 `<Context value={...}>` syntax and direct `ref` prop passing.
- **TS 5.2+ Resource Management**: Added `[Symbol.dispose]` / `[DISPOSE_SYMBOL]` explicit resource disposal handles across `PopoverSnapshotManager`, `BroadcastSync`, and `WorkerResolver`.
- **DRY Modules**: Centralized session ID generation into `uuid.ts` and polymorphic button helpers into `componentUtils.ts`.
- **Prototype Pollution Defense**: Added unified `isSafeKey()` type guard across state and snapshot operations.

## [1.0.9] - 2026-08-12

### Fixed
- **React 18/19 StrictMode Compatibility**: Replaced destructive `destroy()` store cleanup with non-destructive `reset()` on Provider unmount.
- **Canvas DND Indexing**: Fixed virtual index inversion in `PopoverCanvas` so floating entries receive indices `0 ... floating.length - 1`.
- **Style Math & Rotation Safety**: Fixed potential `.toFixed(2)` runtime type errors by sanitizing rotation angles.
- **QuadTree Collisions**: Fixed missed boundary intersections when target bounds straddle quad tree child nodes.
- **Memory Sentinel**: Fixed event listener leak in `BroadcastChannel` sync on channel disposal.

### Refactored
- **Function Composition & Decomposition**: Decomposed heavy nested ternaries and repetitive prop spreads across 16 core areas (`dnd.tsx`, `pinReducers`, polymorphic components, `useGeometry`, `snapshotManager`, `history`).
- **Object Merging**: Replaced 30 inline fallback ternaries in `createTrailEntry` with a clean `mergeEntryOptions` strategy.
- **Placement Strategies**: Replaced placement `switch-case` branches with a lookup map (`PLACEMENT_OFFSET_STRATEGIES`).

## [1.0.8] - 2026-08-09

### Refactored
- **Code Cleanliness & Type Safety**:
  - Eliminated all non-null assertion operators (`!`) across hooks and helper functions.
  - Refactored `handleCardKeyboardNavigation` to use a safe options object pattern with default fallbacks.
  - Standardized inline callbacks in `useCallback` for `PopoverTrigger`, `PopoverCardCloseButton`, and `PopoverCardPinButton` to comply with React Hooks exhaustive-deps rules.
- **Architectural Layering**:
  - Streamlined `usePopoverPropSync` and store prop synchronization logic.
  - Resolved TypeScript `erasableSyntaxOnly` compatibility for FSM status bits (`FSMStatusBit`).
  - Added ambient process type assertions in dev utility modules.
- **Linter & Audit Cleanliness**:
  - Reached 0 errors and 0 warnings on `oxlint`.
  - Passed 441/441 Vitest unit & integration tests across 79 test suites.
  - Validated package exports using `publint` and verified dead-code cleanliness using `knip`.
