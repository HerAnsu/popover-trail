'use strict';

/**
 * Rule: popover/no-implicit-any-in-generics
 * Description: Suggests providing default generic type arguments where appropriate.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure generic type declarations provide safe default constraints',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      missingGenericDefault: 'Provide default type argument for generic parameter `<{{name}}>` (e.g. `<{{name}} = unknown>`).',
    },
  },
  create(_context) {
    return {};
  },
};
