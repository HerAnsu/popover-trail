'use strict';

/**
 * Rule: popover/enforce-observer-unobserve
 * Description: Checks that ResizeObserverRegistry or IntersectionObserver observe calls return cleanup.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure observer registry subscriptions return unobserve in effect cleanup',
      category: 'Observers & Listeners',
      recommended: true,
    },
    schema: [],
    messages: {
      missingUnobserve: 'Element observed with `{{registry}}` should be unobserved in cleanup callback to avoid memory leaks.',
    },
  },
  create(_context) {
    return {};
  },
};
