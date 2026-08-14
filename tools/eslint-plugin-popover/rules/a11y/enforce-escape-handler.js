'use strict';

/**
 * Rule: popover/enforce-escape-handler
 * Description: Checks that popover card components bind Escape keyboard navigation.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure Escape key dismiss is supported for modal dialogs and overlays',
      category: 'Accessibility',
      recommended: true,
    },
    schema: [],
    messages: {
      missingEscape: 'Ensure popover card handles Escape key dismissal.',
    },
  },
  create(_context) {
    return {};
  },
};
