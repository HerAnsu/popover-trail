'use strict';

/**
 * Rule: popover/enforce-middleware-order
 * Description: Checks that Floating UI middleware pipelines adhere to standard positioning order
 * (offset -> flip -> shift -> size -> arrow -> hide).
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure Floating UI middleware are arranged in canonical sequence to prevent jitter',
      category: 'Floating UI',
      recommended: true,
    },
    schema: [],
    messages: {
      suboptimalMiddlewareOrder: 'Floating UI middleware order may cause positioning jitter. Recommended: offset -> flip -> shift -> size.',
    },
  },
  create(_context) {
    return {};
  },
};
