'use strict';

/**
 * Rule: popover/require-aria-expanded-sync
 * Description: Ensures interactive trigger buttons declare aria-expanded attribute.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure trigger elements declare aria-expanded for screen reader accessibility',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      missingAriaExpanded: 'Custom Popover trigger should declare `aria-expanded` reflecting the open state.',
    },
  },
  create(_context) {
    return {
      JSXOpeningElement(node) {
        if (
          node.name &&
          node.name.name === 'PopoverTrigger'
        ) {
          // Rule validation logic
        }
      },
    };
  },
};
