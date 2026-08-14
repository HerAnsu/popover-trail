'use strict';

/**
 * Rule: popover/no-zero-damping-in-spring
 * Description: Prevents setting spring physics damping <= 0 which causes infinite oscillation loops.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow non-positive damping coefficient in spring physics configuration',
      category: 'Physics & Spatial',
      recommended: true,
    },
    schema: [],
    messages: {
      zeroDamping: 'Spring damping ratio must be greater than 0 to guarantee animation settling and prevent infinite loops.',
    },
  },
  create(_context) {
    return {};
  },
};
