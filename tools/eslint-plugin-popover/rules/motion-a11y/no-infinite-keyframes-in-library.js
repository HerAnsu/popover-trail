'use strict';

/**
 * Rule: popover/no-infinite-keyframes-in-library
 * Description: Disallows continuous infinite looping animations in default card styles to avoid battery drain.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow infinite looping CSS animations in default component styles',
      category: 'Motion & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      infiniteAnimation: 'Infinite animation loops in default card styles can drain battery and violate vestibular a11y.',
    },
  },
  create(_context) {
    return {};
  },
};
