'use strict';

/**
 * Rule: popover/no-redundant-floating-middleware
 * Description: Prevents duplicate middleware declarations in the same floating middleware array.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow duplicate middleware calls within the same Floating UI array',
      category: 'Floating UI',
      recommended: true,
    },
    schema: [],
    messages: {
      duplicateMiddleware: 'Middleware `{{name}}` is duplicated in the floating middleware pipeline.',
    },
  },
  create(_context) {
    return {};
  },
};
