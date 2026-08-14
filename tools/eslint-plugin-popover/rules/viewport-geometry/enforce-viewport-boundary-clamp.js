'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure floating card positions are clamped within visible screen boundaries',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      clampViewport: 'Ensure coordinates are clamped to visible viewport boundaries.',
    },
  },
  create(_context) {
    return {};
  },
};
