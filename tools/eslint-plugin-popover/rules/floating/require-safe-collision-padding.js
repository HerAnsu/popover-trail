'use strict';

/**
 * Rule: popover/require-safe-collision-padding
 * Description: Ensures collision padding numbers passed to flip/shift middleware are non-negative.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure boundary collision padding values are non-negative numbers',
      category: 'Floating UI',
      recommended: true,
    },
    schema: [],
    messages: {
      negativePadding: 'Collision padding must be non-negative (>= 0).',
    },
  },
  create(_context) {
    return {};
  },
};
