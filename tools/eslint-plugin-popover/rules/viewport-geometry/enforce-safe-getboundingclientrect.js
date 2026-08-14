'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure element?.getBoundingClientRect() results are verified before accessing dimensions',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      safeRectAccess: 'Verify element existence before invoking getBoundingClientRect().',
    },
  },
  create(_context) {
    return {};
  },
};
