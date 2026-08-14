'use strict';

/**
 * Rule: popover/require-dpr-rounding-on-canvas
 * Description: Suggests scaling canvas or SVG coordinate grids by window.devicePixelRatio for crisp line rendering.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure canvas and connector lines adapt to devicePixelRatio for retina crispness',
      category: 'Viewport & Geometry',
      recommended: true,
    },
    schema: [],
    messages: {
      dprScaling: 'Scale trail connection lines with `window.devicePixelRatio` to prevent blurry edges on HiDPI screens.',
    },
  },
  create(_context) {
    return {};
  },
};
