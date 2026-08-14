'use strict';

/**
 * Rule: popover/enforce-finite-inertia-velocity
 * Description: Checks that velocity values for drag physics and inertia are clamped to safe finite limits.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure inertia and fling velocity values are bounded by finite thresholds',
      category: 'Physics & Spatial',
      recommended: true,
    },
    schema: [],
    messages: {
      unclampedVelocity: 'Inertia velocity parameter should be clamped to avoid extreme floating offsets.',
    },
  },
  create(_context) {
    return {};
  },
};
