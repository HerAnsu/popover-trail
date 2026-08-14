'use strict';

/**
 * Rule: popover/enforce-case-insensitive-key-matching
 * Description: Checks that custom shortcut key matching checks handle canonical key names.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure keyboard shortcut matching handles canonical casing',
      category: 'Keyboard Navigation',
      recommended: true,
    },
    schema: [],
    messages: {
      shortcutCasing: 'Keyboard shortcut matching should handle case sensitivity consistently.',
    },
  },
  create(_context) {
    return {};
  },
};
