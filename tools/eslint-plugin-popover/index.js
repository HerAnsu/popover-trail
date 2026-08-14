'use strict';

const requireSsrGuard = require('./rules/ssr/require-ssr-guard');
const noDirectDomMutation = require('./rules/ssr/no-direct-dom-mutation');
const strictLayerBoundaries = require('./rules/architecture/strict-layer-boundaries');
const noRawZIndexLiterals = require('./rules/architecture/no-raw-zindex-literals');
const requireMemoOnDragHandlers = require('./rules/performance/require-memo-on-drag-handlers');
const noInlineStoreSubscriptions = require('./rules/performance/no-inline-store-subscriptions');
const enforceTimerCleanup = require('./rules/memory-timers/enforce-timer-cleanup');
const noDirectStateMutation = require('./rules/memory-timers/no-direct-state-mutation');
const enforcePoolReleaseInFinally = require('./rules/memory-timers/enforce-pool-release-in-finally');
const enforceFiniteCoordinates = require('./rules/geometry/enforce-finite-coordinates');
const noDetachedDomInStore = require('./rules/geometry/no-detached-dom-in-store');
const enforceFocusRestoration = require('./rules/a11y/enforce-focus-restoration');
const requireAriaExpandedSync = require('./rules/a11y/require-aria-expanded-sync');
const enforceEscapeHandler = require('./rules/a11y/enforce-escape-handler');
const enforceTypedEventDispatch = require('./rules/cross-tab-bus/enforce-typed-event-dispatch');
const sanitizeSnapshotPayload = require('./rules/cross-tab-bus/sanitize-snapshot-payload');
const requireDisplayName = require('./rules/api-design/require-display-name');
const preferEarlyReturnOnInactive = require('./rules/api-design/prefer-early-return-on-inactive');

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
};

module.exports = {
  rules,
};
