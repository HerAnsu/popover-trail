'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure modules avoid top-level side-effects to preserve pure tree-shaking',
      category: 'Bundling & Tree-Shaking',
      recommended: true,
    },
    schema: [],
    messages: {
      topLevelSideEffect: 'Avoid top-level side-effect at module evaluation time to ensure optimal tree-shaking.',
    },
  },
  create(_context) {
    return {};
  },
};
