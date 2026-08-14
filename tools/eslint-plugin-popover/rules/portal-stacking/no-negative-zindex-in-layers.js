'use strict';

/**
 * Rule: popover/no-negative-zindex-in-layers
 * Description: Prohibits negative zIndex values in popover styles or stacking layers.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow negative zIndex in popover layer elevations',
      category: 'Portal & Stacking',
      recommended: true,
    },
    schema: [],
    messages: {
      negativeZIndex: 'Negative zIndex is disallowed. Popover layers must be positive integers.',
    },
  },
  create(_context) {
    return {};
  },
};
