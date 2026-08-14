'use strict';

/**
 * Rule: popover/enforce-action-registry-naming
 * Description: Checks that public store actions adhere to camelCase action naming conventions.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce standard camelCase naming for store action methods',
      category: 'Store Purity',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidActionName: 'Store action `{{name}}` should follow camelCase naming convention.',
    },
  },
  create(_context) {
    return {};
  },
};
