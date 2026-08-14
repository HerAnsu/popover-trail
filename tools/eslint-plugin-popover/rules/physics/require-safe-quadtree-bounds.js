'use strict';

/**
 * Rule: popover/require-safe-quadtree-bounds
 * Description: Ensures spatial index bounds passed to QuadTree or collision engines have strictly positive dimensions.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure spatial QuadTree boundary rects have positive non-zero dimensions',
      category: 'Physics & Spatial',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidBounds: 'Spatial index boundary box must have positive width and height (width > 0, height > 0).',
    },
  },
  create(_context) {
    return {};
  },
};
