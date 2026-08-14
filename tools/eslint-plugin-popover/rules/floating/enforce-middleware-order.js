'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure Floating UI middleware are arranged in canonical sequence',
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
