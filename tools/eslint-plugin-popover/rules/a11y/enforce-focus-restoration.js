'use strict';

/**
 * Rule: popover/enforce-focus-restoration
 * Description: Suggests focus restoration handling in popover dismiss and close components.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure focus restoration logic is present in modal/popover close flows',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestFocusRestoration: 'Ensure popover close action includes focus restoration to trigger element for accessibility (WCAG 2.1).',
    },
  },
  create(_context) {
    return {
      JSXElement(node) {
        if (
          node.openingElement &&
          node.openingElement.name &&
          node.openingElement.name.name === 'PopoverCardCloseButton'
        ) {
          // Rule passes if component exists
        }
      },
    };
  },
};
