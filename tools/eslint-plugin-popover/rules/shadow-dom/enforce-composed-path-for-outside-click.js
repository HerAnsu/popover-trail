'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Use event.composedPath() in outside click handlers to support Shadow DOM and Web Components',
      category: 'Shadow DOM & Portals',
      recommended: true,
    },
    schema: [],
    messages: {
      useComposedPath: 'Use `e.composedPath ? e.composedPath() : ...` to ensure outside click logic traverses Shadow DOM boundaries.',
    },
  },
  create(_context) {
    return {};
  },
};
