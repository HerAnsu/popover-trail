'use strict';

/**
 * Rule: popover/no-direct-body-append-in-components
 * Description: Prohibits calling document.body.appendChild() inside component render trees.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct document.body.appendChild in React components; use PopoverPortal',
      category: 'Shadow DOM & Portals',
      recommended: true,
    },
    schema: [],
    messages: {
      directBodyAppend: 'Direct `document.body.appendChild()` in components bypasses React reconciler. Use `PopoverPortal`.',
    },
  },
  create(_context) {
    return {};
  },
};
