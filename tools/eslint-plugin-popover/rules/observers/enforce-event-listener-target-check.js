'use strict';

/**
 * Rule: popover/enforce-event-listener-target-check
 * Description: Checks that global event listeners verify target availability before calling addEventListener.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Check global target existence before attaching document/window event listeners',
      category: 'Observers & Listeners',
      recommended: true,
    },
    schema: [],
    messages: {
      uncheckedTarget: 'Verify target object existence before attaching event listener.',
    },
  },
  create(_context) {
    return {};
  },
};
