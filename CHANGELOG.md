# Changelog

All notable changes to the `popover-trail` package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-08-13

### Refactored & Code Quality
- **React Doctor & Accessibility Polish**:
  - Replaced custom dialog structures with HTML5 `<dialog>` element in `dnd.tsx`, preserving native accessibility and dialog semantics.
  - Eliminated ref mutations during render across animation and geometry hooks (`useGeometry.ts`, `useDragAndDrop.ts`).
  - Pruned intermediate barrel files and unified direct imports from submodule paths.
- **Architectural Decoupling & Modular Utilities**:
  - Decomposed monolithic `storeHelpers.ts` into zero-dependency standalone modules:
    - [`clsx.ts`](file:///src/lib/popover/utils/clsx.ts) for class name composition.
    - [`equality.ts`](file:///src/lib/popover/utils/equality.ts) for `shallowEqual` and `isDeepEqual`.
    - [`domEvents.ts`](file:///src/lib/popover/utils/domEvents.ts) for Shadow DOM and event path inspection.
  - Decomposed cognitive complexity hotspots:
    - `resolvePopoverEntry` in `storeResolverPipeline.ts` split into cohesive resolution lifecycle steps while preserving synchronous execution contract for cached data and sync resolvers.
    - `handleCardKeyboardNavigation` in `usePopoverCard.ts` split into dedicated arrow and escape dispatch handlers.
    - `popoverFSMReducer` in `fsm.ts` modularized into state-specific transition handlers.
- **Clean Code & SRP Modularization**:
  - Modularized `devWarnings.ts` into isolated domain validators under `src/lib/popover/validators/` (`validateTrigger.ts`, `validateProvider.ts`, `validateComponentScope.ts`, `validateStorageAndState.ts`, `validatePerformance.ts`, `warningEngine.ts`).
  - Separated value objects into standalone `Point2D.ts` and `RectBounds.ts`.
  - Decomposed composite hooks `useGeometry.ts` and `usePopoverCard.ts` into focused sub-modules (`geometry/useFloatingSetup.ts`, `geometry/geometryUtils.ts`, `card/useCardKeyboardNav.ts`, `card/useCardFocusManagement.ts`, `card/useCardStoreSlice.ts`).
  - Introduced expressive entry factory methods (`createSuccessEntry`, `createLoadingEntry`, `createErrorEntry`, `createIdleEntry`) eliminating ambiguous flag parameters.
- **Linter Hardening & Dual-Engine Architecture**:
  - Integrated ESLint Flat Config (`eslint.config.mjs`) alongside Oxlint with `eslint-plugin-oxlint` to eliminate duplicate rule checks while keeping sub-second execution speed.
  - Added full plugin suite:
    - `@e18e/eslint-plugin` for modern V8 engine optimizations (`prefer-object-has-own`, `prefer-array-at`, `prefer-spread-syntax`, `prefer-flatmap-over-map-flat`).
    - `eslint-plugin-sonarjs` for cognitive complexity checks, jump redundancy, and code smell prevention.
    - `eslint-plugin-regexp` for ReDoS security and RegExp optimization (`no-super-linear-backtracking`).
    - `@stylistic/eslint-plugin` for unified formatting and type annotation delimiters.
    - `eslint-plugin-testing-library` for testing queries and DOM standards.
    - `eslint-plugin-storybook` for Storybook metadata declarations.
    - `eslint-plugin-react-hooks` for comprehensive hook safety and dependency validation.
  - Added dedicated npm scripts: `lint:ox`, `lint:eslint`, `lint:fix` and combined `npm run lint`.
- **Fallow Quality & Complexity Reduction**:
  - Reduced **all 39 high-complexity functions** flagged by `fallow health` down to **0 functions above threshold** across the entire codebase.
  - Extracted modular single-responsibility helpers across `storeResolverPipeline.ts`, `useGeometry.ts`, `usePopoverCard.ts`, `sliceResolver.ts`, `slicePersistence.ts`, `snapshotManager.ts`, `dnd.tsx`, and `storeHelpers.ts`.
  - Achieved **0 dead code issues**, **0 code duplicates**, and **0 circular dependencies** across all 93 entry points.
  - Maintained Maintainability Index score of **91.5 (Good)** and React Doctor score of **100 / 100 Great**.

### Tests & Verification
- **Test Suite Expansion**:
  - Added comprehensive stress, concurrency, and edge-case suites in `storeStressAndEdgeCases.test.ts`.
  - Added complete CQRS `PopoverQueryBus` and `PopoverCommandBus` property and method test coverage.
  - Expanded layout strategies and value objects geometry conversion tests.
  - Total test count increased to **474 passing tests** across 80 test suites.

## [1.1.1] - 2026-08-13

### Fixed
- **Drag-and-Drop Tilt Physics (`dnd.tsx`)**: Fixed missing `cardRef` in `usePopoverDragAndDrop` call inside `usePopoverDraggableCard`, restoring element-level spring rotation angle mutations (`--pt-rotate-z`) during drag gestures.
- **Store Subscription Deduplication (`PopoverTrigger.tsx`, `usePopoverTriggers.ts`)**: Added optional `explicitIsOpen` parameter to `usePopoverTrigger` and `usePopoverNestedTrigger` to skip duplicate store state subscriptions in trigger inner components.
- **Stable Click-Outside Event Listeners (`useClickOutside.ts`)**: Ref-wrapped `shouldIgnoreClick` callback to prevent capture-phase document event listeners from detaching and re-attaching on inline function updates.

### Performance & Memory Optimizations
- **Zero-Dependency `equalityFn` Store Selector Memoization (`usePopoverStore.ts`)**: Implemented a pure, zero-dependency ref-memoized selector mechanism inside `usePopoverStore` compatible with Zustand 5 and React 18/19 Concurrent Mode, preventing unnecessary component re-renders when using custom equality functions (e.g. `shallowEqual`).
- **Batched Geometry Store Selectors (`useGeometry.ts`)**: Consolidated 4 separate `usePopoverStore` selector calls into a single batched pass with `shallowEqual`.
- **Render & Prop Sync Optimizations (`usePopoverPropSync.ts`, `PopoverPortal.tsx`, `PopoverTrail.tsx`)**:
  - Removed unmemoized parent `props` object from `usePopoverPropSync` dependency list using a stable `propsRef`.
  - Removed inline `children` render prop from `useMemo` dependency array in `PopoverPortal.tsx`.
  - Ref-wrapped `filter` callback in `PopoverTrail.tsx` to avoid array re-filtering on parent re-renders.

### Refactored & Standards
- **React 19 Internal Dispatcher Support (`factory.tsx`, `usePopoverSelectors.ts`)**: Added support for React 19 `__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED` fallback alongside `__SECRET_INTERNALS...`.
- **Sub-Component Decoupling (`componentUtils.ts`)**: Centralized `getPolymorphicProps` and `createSubComponentClickHandler` into `utils/componentUtils.ts`, resolving sibling dependency between `PopoverCardPinButton` and `PopoverCardCloseButton`.
- **Explicit Resource Management Cleanups (`broadcastSync.ts`, `disposable.ts`)**: Cleaned up `Symbol.dispose ?? Symbol.for('Symbol.dispose')` fallback declarations.

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
