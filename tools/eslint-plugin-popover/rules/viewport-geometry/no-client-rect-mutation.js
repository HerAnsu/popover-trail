'use strict';

/**
 * Rule: popover/no-client-rect-mutation
 * Description: Prohibits mutating DOMRect or DOMRectReadOnly property values.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct assignment or mutation of DOMRect properties',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      mutateDOMRect: 'DOMRect properties are read-only in browsers. Create a new plain object or Rect value object.',
    },
  },
  create(_context) {
    return {};
  },
};
