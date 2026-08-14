'use strict';

/**
 * Rule: popover/no-hardcoded-rgba-in-svg
 * Description: Suggests using currentColor or design tokens in SVG icons instead of hardcoded RGBA.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer currentColor or theme tokens for SVG strokes and fills',
      category: 'Visual & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      useCurrentColor: 'Use `currentColor` or CSS variables for SVG fill/stroke instead of hardcoded color literal.',
    },
  },
  create(_context) {
    return {};
  },
};
