'use strict';

// Group A: SSR & DOM Safety
const requireSsrGuard = require('./rules/ssr/require-ssr-guard');
const noDirectDomMutation = require('./rules/ssr/no-direct-dom-mutation');

// Group B: Clean Architecture
const strictLayerBoundaries = require('./rules/architecture/strict-layer-boundaries');
const noRawZIndexLiterals = require('./rules/architecture/no-raw-zindex-literals');

// Group C: Performance (60/120 FPS & Gestures)
const requireMemoOnDragHandlers = require('./rules/performance/require-memo-on-drag-handlers');
const noInlineStoreSubscriptions = require('./rules/performance/no-inline-store-subscriptions');

// Group D: Memory & Timers
const enforceTimerCleanup = require('./rules/memory-timers/enforce-timer-cleanup');
const noDirectStateMutation = require('./rules/memory-timers/no-direct-state-mutation');
const enforcePoolReleaseInFinally = require('./rules/memory-timers/enforce-pool-release-in-finally');

// Group E: Geometry & Coordinates
const enforceFiniteCoordinates = require('./rules/geometry/enforce-finite-coordinates');
const noDetachedDomInStore = require('./rules/geometry/no-detached-dom-in-store');

// Group F: Accessibility & Navigation
const enforceFocusRestoration = require('./rules/a11y/enforce-focus-restoration');
const requireAriaExpandedSync = require('./rules/a11y/require-aria-expanded-sync');
const enforceEscapeHandler = require('./rules/a11y/enforce-escape-handler');

// Group G: Cross-Tab & EventBus
const enforceTypedEventDispatch = require('./rules/cross-tab-bus/enforce-typed-event-dispatch');
const sanitizeSnapshotPayload = require('./rules/cross-tab-bus/sanitize-snapshot-payload');

// Group H: Component API Design
const requireDisplayName = require('./rules/api-design/require-display-name');
const preferEarlyReturnOnInactive = require('./rules/api-design/prefer-early-return-on-inactive');

// Group I: Concurrency & Resolvers
const noUnhandledResolverPromise = require('./rules/concurrency/no-unhandled-resolver-promise');
const enforceCancellationTokenCheck = require('./rules/concurrency/enforce-cancellation-token-check');
const noRaceConditionInFetch = require('./rules/concurrency/no-race-condition-in-fetch');

// Group J: Physics & Spatial
const enforceFiniteInertiaVelocity = require('./rules/physics/enforce-finite-inertia-velocity');
const requireSafeQuadtreeBounds = require('./rules/physics/require-safe-quadtree-bounds');
const noZeroDampingInSpring = require('./rules/physics/no-zero-damping-in-spring');

// Group K: Context & Store Scoping
const requireProviderWrapOnHooks = require('./rules/context-scope/require-provider-wrap-on-hooks');
const enforceShallowEqualOnCompositeSelectors = require('./rules/context-scope/enforce-shallow-equal-on-composite-selectors');
const noNestedPopoverProviders = require('./rules/context-scope/no-nested-popover-providers');

// Group L: Security & Content
const noDangerouslySetInnerHTML = require('./rules/security/no-dangerously-set-inner-html');
const sanitizeCustomHtmlAttributes = require('./rules/security/sanitize-custom-html-attributes');

// Group M: Testing & Mock Harness
const enforceCleanupAfterMockTimers = require('./rules/testing/enforce-cleanup-after-mock-timers');

// Group N: Floating UI Middleware
const enforceMiddlewareOrder = require('./rules/floating/enforce-middleware-order');
const requireSafeCollisionPadding = require('./rules/floating/require-safe-collision-padding');
const noRedundantFloatingMiddleware = require('./rules/floating/no-redundant-floating-middleware');

// Group O: Observers & Listeners
const enforceObserverUnobserve = require('./rules/observers/enforce-observer-unobserve');
const noPassiveFalseOnScrollWheel = require('./rules/observers/no-passive-false-on-scroll-wheel');
const enforceEventListenerTargetCheck = require('./rules/observers/enforce-event-listener-target-check');

// Group P: Store Purity
const enforcePureReducerReturn = require('./rules/store-purity/enforce-pure-reducer-return');
const noAsyncInReducers = require('./rules/store-purity/no-async-in-reducers');
const enforceActionRegistryNaming = require('./rules/store-purity/enforce-action-registry-naming');

// Group Q: DOM Attributes & Tokens
const enforcePrefixedDataAttributes = require('./rules/tokens-dom/enforce-prefixed-data-attributes');
const noInlineStyleOverrideOnTokens = require('./rules/tokens-dom/no-inline-style-override-on-tokens');

// Group R: Transitions
const enforceTransitionTimeoutSync = require('./rules/transitions/enforce-transition-timeout-sync');
const noUnboundedScaleTransform = require('./rules/transitions/no-unbounded-scale-transform');

// Group S: Keyboard Navigation & Shortcuts
const enforcePreventDefaultOnNavKeys = require('./rules/keyboard-nav/enforce-prevent-default-on-nav-keys');
const noUnscopedKeyboardListeners = require('./rules/keyboard-nav/no-unscoped-keyboard-listeners');
const enforceCaseInsensitiveKeyMatching = require('./rules/keyboard-nav/enforce-case-insensitive-key-matching');

// Group T: History & Snapshots
const enforceMaxHistoryLimit = require('./rules/history/enforce-max-history-limit');
const noDirectHistoryStackPush = require('./rules/history/no-direct-history-stack-push');
const requireSnapshotDeserializerFallback = require('./rules/history/require-snapshot-deserializer-fallback');

// Group U: DAG & Lineage
const noCircularDagEdges = require('./rules/dag/no-circular-dag-edges');
const enforceOrphanCleanupOnParentClose = require('./rules/dag/enforce-orphan-cleanup-on-parent-close');

// Group V: Responsive & Viewport
const enforcePositiveBreakpointWidth = require('./rules/responsive/enforce-positive-breakpoint-width');
const noViewportResizeWithoutDebounce = require('./rules/responsive/no-viewport-resize-without-debounce');

// Group W: Hooks Polish
const enforceUseIsomorphicLayoutEffect = require('./rules/hooks-polish/enforce-use-isomorphic-layout-effect');

// Group X: Gestures & Pointer
const enforceTouchActionNoneOnDraggable = require('./rules/gestures/enforce-touch-action-none-on-draggable');
const enforcePointerCaptureRelease = require('./rules/gestures/enforce-pointer-capture-release');
const noMouseTouchEventDuplication = require('./rules/gestures/no-mouse-touch-event-duplication');

// Group Y: Focus Trap & Modality
const enforceInertAttributeOnBackground = require('./rules/focus-trap/enforce-inert-attribute-on-background');
const requireAutofocusCleanup = require('./rules/focus-trap/require-autofocus-cleanup');
const noTabIndexGreaterThanZero = require('./rules/focus-trap/no-tabindex-greater-than-zero');

// Group Z: Portal & Stacking
const enforcePortalTargetValidation = require('./rules/portal-stacking/enforce-portal-target-validation');
const noNegativeZIndexInLayers = require('./rules/portal-stacking/no-negative-zindex-in-layers');
const enforceUniqueStackGroupIds = require('./rules/portal-stacking/enforce-unique-stack-group-ids');

// Group AA: Worker & Offload
const enforceWorkerTerminateOnUnmount = require('./rules/worker/enforce-worker-terminate-on-unmount');
const noDomAccessInWorkerResolver = require('./rules/worker/no-dom-access-in-worker-resolver');

// Group AB: Diagnostics & Warnings
const enforceDevWarningPrefix = require('./rules/diagnostics/enforce-dev-warning-prefix');
const noUnfilteredConsoleErrorInLib = require('./rules/diagnostics/no-unfiltered-console-error-in-lib');

// Group AC: Bundling & Side-Effects
const noTopLevelSideEffects = require('./rules/bundling/no-top-level-side-effects');
const enforceExplicitTypeOnlyExports = require('./rules/bundling/enforce-explicit-type-only-exports');
const noWildcardInternalReexports = require('./rules/bundling/no-wildcard-internal-reexports');

// Group AD: GC & Memory
const preferWeakmapForDomAssociations = require('./rules/gc-memory/prefer-weakmap-for-dom-associations');
const enforceClearOnLruCacheDestroy = require('./rules/gc-memory/enforce-clear-on-lru-cache-destroy');
const noClosureLeakInTimeoutCallbacks = require('./rules/gc-memory/no-closure-leak-in-timeout-callbacks');

// Group AE: RTL & Logical
const enforceLogicalCssProperties = require('./rules/rtl/enforce-logical-css-properties');
const requireDirAttributeSync = require('./rules/rtl/require-dir-attribute-sync');

// Group AF: Shadow DOM & Portals
const enforceComposedPathForOutsideClick = require('./rules/shadow-dom/enforce-composed-path-for-outside-click');
const noDirectBodyAppendInComponents = require('./rules/shadow-dom/no-direct-body-append-in-components');

// Group AG: Motion & A11y
const respectPrefersReducedMotion = require('./rules/motion-a11y/respect-prefers-reduced-motion');
const noInfiniteKeyframesInLibrary = require('./rules/motion-a11y/no-infinite-keyframes-in-library');
const enforceWillChangeCleanup = require('./rules/motion-a11y/enforce-will-change-cleanup');

const rules = {
  'require-ssr-guard': requireSsrGuard,
  'no-direct-dom-mutation': noDirectDomMutation,
  'strict-layer-boundaries': strictLayerBoundaries,
  'no-raw-zindex-literals': noRawZIndexLiterals,
  'require-memo-on-drag-handlers': requireMemoOnDragHandlers,
  'no-inline-store-subscriptions': noInlineStoreSubscriptions,
  'enforce-timer-cleanup': enforceTimerCleanup,
  'no-direct-state-mutation': noDirectStateMutation,
  'enforce-pool-release-in-finally': enforcePoolReleaseInFinally,
  'enforce-finite-coordinates': enforceFiniteCoordinates,
  'no-detached-dom-in-store': noDetachedDomInStore,
  'enforce-focus-restoration': enforceFocusRestoration,
  'require-aria-expanded-sync': requireAriaExpandedSync,
  'enforce-escape-handler': enforceEscapeHandler,
  'enforce-typed-event-dispatch': enforceTypedEventDispatch,
  'sanitize-snapshot-payload': sanitizeSnapshotPayload,
  'require-display-name': requireDisplayName,
  'prefer-early-return-on-inactive': preferEarlyReturnOnInactive,
  'no-unhandled-resolver-promise': noUnhandledResolverPromise,
  'enforce-cancellation-token-check': enforceCancellationTokenCheck,
  'no-race-condition-in-fetch': noRaceConditionInFetch,
  'enforce-finite-inertia-velocity': enforceFiniteInertiaVelocity,
  'require-safe-quadtree-bounds': requireSafeQuadtreeBounds,
  'no-zero-damping-in-spring': noZeroDampingInSpring,
  'require-provider-wrap-on-hooks': requireProviderWrapOnHooks,
  'enforce-shallow-equal-on-composite-selectors': enforceShallowEqualOnCompositeSelectors,
  'no-nested-popover-providers': noNestedPopoverProviders,
  'no-dangerously-set-inner-html': noDangerouslySetInnerHTML,
  'sanitize-custom-html-attributes': sanitizeCustomHtmlAttributes,
  'enforce-cleanup-after-mock-timers': enforceCleanupAfterMockTimers,
  'enforce-middleware-order': enforceMiddlewareOrder,
  'require-safe-collision-padding': requireSafeCollisionPadding,
  'no-redundant-floating-middleware': noRedundantFloatingMiddleware,
  'enforce-observer-unobserve': enforceObserverUnobserve,
  'no-passive-false-on-scroll-wheel': noPassiveFalseOnScrollWheel,
  'enforce-event-listener-target-check': enforceEventListenerTargetCheck,
  'enforce-pure-reducer-return': enforcePureReducerReturn,
  'no-async-in-reducers': noAsyncInReducers,
  'enforce-action-registry-naming': enforceActionRegistryNaming,
  'enforce-prefixed-data-attributes': enforcePrefixedDataAttributes,
  'no-inline-style-override-on-tokens': noInlineStyleOverrideOnTokens,
  'enforce-transition-timeout-sync': enforceTransitionTimeoutSync,
  'no-unbounded-scale-transform': noUnboundedScaleTransform,
  'enforce-prevent-default-on-nav-keys': enforcePreventDefaultOnNavKeys,
  'no-unscoped-keyboard-listeners': noUnscopedKeyboardListeners,
  'enforce-case-insensitive-key-matching': enforceCaseInsensitiveKeyMatching,
  'enforce-max-history-limit': enforceMaxHistoryLimit,
  'no-direct-history-stack-push': noDirectHistoryStackPush,
  'require-snapshot-deserializer-fallback': requireSnapshotDeserializerFallback,
  'no-circular-dag-edges': noCircularDagEdges,
  'enforce-orphan-cleanup-on-parent-close': enforceOrphanCleanupOnParentClose,
  'enforce-positive-breakpoint-width': enforcePositiveBreakpointWidth,
  'no-viewport-resize-without-debounce': noViewportResizeWithoutDebounce,
  'enforce-use-isomorphic-layout-effect': enforceUseIsomorphicLayoutEffect,
  'enforce-touch-action-none-on-draggable': enforceTouchActionNoneOnDraggable,
  'enforce-pointer-capture-release': enforcePointerCaptureRelease,
  'no-mouse-touch-event-duplication': noMouseTouchEventDuplication,
  'enforce-inert-attribute-on-background': enforceInertAttributeOnBackground,
  'require-autofocus-cleanup': requireAutofocusCleanup,
  'no-tabindex-greater-than-zero': noTabIndexGreaterThanZero,
  'enforce-portal-target-validation': enforcePortalTargetValidation,
  'no-negative-zindex-in-layers': noNegativeZIndexInLayers,
  'enforce-unique-stack-group-ids': enforceUniqueStackGroupIds,
  'enforce-worker-terminate-on-unmount': enforceWorkerTerminateOnUnmount,
  'no-dom-access-in-worker-resolver': noDomAccessInWorkerResolver,
  'enforce-dev-warning-prefix': enforceDevWarningPrefix,
  'no-unfiltered-console-error-in-lib': noUnfilteredConsoleErrorInLib,
  'no-top-level-side-effects': noTopLevelSideEffects,
  'enforce-explicit-type-only-exports': enforceExplicitTypeOnlyExports,
  'no-wildcard-internal-reexports': noWildcardInternalReexports,
  'prefer-weakmap-for-dom-associations': preferWeakmapForDomAssociations,
  'enforce-clear-on-lru-cache-destroy': enforceClearOnLruCacheDestroy,
  'no-closure-leak-in-timeout-callbacks': noClosureLeakInTimeoutCallbacks,
  'enforce-logical-css-properties': enforceLogicalCssProperties,
  'require-dir-attribute-sync': requireDirAttributeSync,
  'enforce-composed-path-for-outside-click': enforceComposedPathForOutsideClick,
  'no-direct-body-append-in-components': noDirectBodyAppendInComponents,
  'respect-prefers-reduced-motion': respectPrefersReducedMotion,
  'no-infinite-keyframes-in-library': noInfiniteKeyframesInLibrary,
  'enforce-will-change-cleanup': enforceWillChangeCleanup,
};

module.exports = {
  rules,
};
