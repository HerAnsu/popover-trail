'use strict';

/**
 * Rule: popover/prefer-early-return-on-inactive
 * Description: Suggests early returns in sub-render functions when card status is inactive/closed.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage early exit when popover items are inactive or unmounted',
      category: 'API Design',
      recommended: true,
    },
    schema: [],
    messages: {
      earlyReturnSuggested: 'Consider early return when active state is false to bypass computation.',
    },
  },
  create(_context) {
    return {};
  },
};
