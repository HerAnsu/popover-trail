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
};

module.exports = {
  rules,
};
