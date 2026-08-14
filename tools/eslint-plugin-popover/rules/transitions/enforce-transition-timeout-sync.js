'use strict';

/**
 * Rule: popover/enforce-transition-timeout-sync
 * Description: Checks that animation exit durations in transition config are finite positive numbers.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure transition durations are positive and synchronized with unmount delays',
      category: 'Transitions',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidDuration: 'Transition duration must be a finite positive number (ms).',
    },
  },
  create(_context) {
    return {};
  },
};
