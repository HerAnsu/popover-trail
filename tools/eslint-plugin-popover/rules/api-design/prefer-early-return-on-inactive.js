'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer early return null when popover is inactive or not mounted',
      category: 'Component API Design',
      recommended: true,
    },
    schema: [],
    messages: {
      earlyReturn: 'Prefer early return null when isOpen / isMounted is false.',
    },
  },
  create(_context) {
    return {};
  },
};
