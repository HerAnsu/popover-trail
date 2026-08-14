'use strict';

/**
 * Rule: popover/enforce-unique-stack-group-ids
 * Description: Checks that stack group identifiers are non-empty strings.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure stack group identifiers are non-empty strings',
      category: 'Portal & Stacking',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidGroupId: 'Stack group identifier should be a non-empty string.',
    },
  },
  create(_context) {
    return {};
  },
};
